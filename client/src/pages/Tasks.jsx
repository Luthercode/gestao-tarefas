import { useState, useEffect } from 'react';
import api from '../api';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterProject, setFilterProject] = useState('');

  const fetchTasks = async () => {
    try {
      const params = { limit: 100, sort: '-createdAt' };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;
      if (filterProject) params.project = filterProject;
      const res = await api.get('/tasks', { params });
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects?limit=100');
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProjects(); }, []);
  useEffect(() => { fetchTasks(); }, [search, filterStatus, filterPriority, filterProject]);

  const updateStatus = async (id, status) => {
    await api.put(`/tasks/${id}`, { status });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Remover esta tarefa?')) return;
    await api.delete(`/tasks/${id}`);
    fetchTasks();
  };

  const statusLabels = { todo: 'A Fazer', 'in-progress': 'Em Progresso', review: 'Revisão', done: 'Concluída' };
  const priorityLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };

  if (loading) return <div className="loading">Carregando tarefas...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Todas as Tarefas</h1>
          <p className="page-subtitle">{tasks.length} tarefa(s)</p>
        </div>
      </div>

      <div className="filters-row">
        <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar tarefas..." />
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="filter-select">
          <option value="">Todos os projetos</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="filter-select">
          <option value="">Todas prioridades</option>
          {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">Nenhuma tarefa encontrada</div>
      ) : (
        <div className="tasks-table-wrap">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Título</th>
                <th>Projeto</th>
                <th>Prioridade</th>
                <th>Prazo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task._id}>
                  <td>
                    <select value={task.status} onChange={e => updateStatus(task._id, e.target.value)} className="status-select">
                      {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="task-cell-title">{task.title}</div>
                    {task.description && <div className="task-cell-desc">{task.description}</div>}
                  </td>
                  <td><span className="meta-text">{task.project?.name || '—'}</span></td>
                  <td><span className={`badge-sm badge-${task.priority}`}>{priorityLabels[task.priority]}</span></td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : '—'}</td>
                  <td>
                    <button onClick={() => deleteTask(task._id)} className="btn-xs btn-delete">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tasks;
