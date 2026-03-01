const Task = require('../models/Task');

// GET /api/tasks
exports.getTasks = async (req, res) => {
  try {
    const { project, status, priority, assignedTo, search, sort = '-createdAt', page = 1, limit = 20 } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(filter)
        .populate('project', 'name')
        .populate('assignedTo', 'name')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(filter)
    ]);

    res.json({
      data: tasks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar tarefas.', error: err.message });
  }
};

// GET /api/tasks/:id
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email');

    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar tarefa.', error: err.message });
  }
};

// POST /api/tasks
exports.createTask = async (req, res) => {
  try {
    const { title, description, project, assignedTo, status, priority, dueDate, tags } = req.body;

    const task = await Task.create({
      title, description, project, assignedTo,
      status, priority, dueDate,
      tags: tags || []
    });

    const populated = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name');

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar tarefa.', error: err.message });
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });

    const { title, description, assignedTo, status, priority, dueDate, tags } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (tags !== undefined) task.tags = tags;

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('project', 'name')
      .populate('assignedTo', 'name');

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa.', error: err.message });
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarefa não encontrada.' });

    await task.deleteOne();
    res.json({ message: 'Tarefa removida.' });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao remover tarefa.', error: err.message });
  }
};
