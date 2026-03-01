const Project = require('../models/Project');
const Task = require('../models/Task');

// GET /api/projects
exports.getProjects = async (req, res) => {
  try {
    const { status, priority, search, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    const filter = {
      $or: [{ owner: req.user._id }, { members: req.user._id }]
    };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$and = [
        { $or: filter.$or },
        { $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]}
      ];
      delete filter.$or;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [projects, total] = await Promise.all([
      Project.find(filter)
        .populate('owner', 'name email')
        .populate('members', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Project.countDocuments(filter)
    ]);

    res.json({
      data: projects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar projetos.', error: err.message });
  }
};

// GET /api/projects/stats
exports.getProjectStats = async (req, res) => {
  try {
    const userFilter = { $or: [{ owner: req.user._id }, { members: req.user._id }] };

    const [statusStats, priorityStats, totalTasks, completedTasks] = await Promise.all([
      Project.aggregate([
        { $match: userFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Project.aggregate([
        { $match: userFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ]),
      Task.countDocuments(),
      Task.countDocuments({ status: 'done' })
    ]);

    const totalProjects = statusStats.reduce((acc, s) => acc + s.count, 0);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      byStatus: statusStats.reduce((acc, s) => { acc[s._id] = s.count; return acc; }, {}),
      byPriority: priorityStats.reduce((acc, p) => { acc[p._id] = p.count; return acc; }, {})
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas.', error: err.message });
  }
};

// GET /api/projects/:id
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    const tasks = await Task.find({ project: project._id })
      .populate('assignedTo', 'name')
      .sort('-createdAt');

    res.json({ project, tasks });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar projeto.', error: err.message });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, status, priority, deadline, tags } = req.body;

    const project = await Project.create({
      name, description, status, priority, deadline,
      tags: tags || [],
      owner: req.user._id,
      members: [req.user._id]
    });

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar projeto.', error: err.message });
  }
};

// PUT /api/projects/:id
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    const { name, description, status, priority, deadline, tags } = req.body;

    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;
    if (priority !== undefined) project.priority = priority;
    if (deadline !== undefined) project.deadline = deadline;
    if (tags !== undefined) project.tags = tags;

    await project.save();

    const populated = await Project.findById(project._id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar projeto.', error: err.message });
  }
};

// DELETE /api/projects/:id
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projeto não encontrado.' });

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Projeto e tarefas removidos.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover projeto.', error: err.message });
  }
};
