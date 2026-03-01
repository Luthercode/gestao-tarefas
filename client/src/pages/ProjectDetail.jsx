import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'todo', priority: 'media', dueDate: '' });

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data.project);
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [id]);

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      setTaskForm({ title: '', description: '', status: 'todo', priority: 'media', dueDate: '' });
      setShowTaskForm(false);
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    fetchProject();
  };

  const deleteTask = async (taskId) => {
    await api.delete(`/tasks/${taskId}`);
    fetchProject();
  };

  const statusLabels = { todo: 'A Fazer', 'in-progress': 'Em Progresso', review: 'Revisão', done: 'Concluída' };
  const statusOrder = ['todo', 'in-progress', 'review', 'done'];
  const priorityLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };
  const projStatusLabels = { 'planejamento': 'Planejamento', 'em-andamento': 'Em Andamento', 'pausado': 'Pausado', 'concluido': 'Concluído', 'cancelado': 'Cancelado' };

  if (loading) return <div className="loading">Carregando projeto...</div>;
  if (!project) return <div className="empty-state">Projeto não encontrado</div>;

  return (
    <div className="page">
      <Link to="/projects" className="back-link">← Voltar aos Projetos</Link>

      <div className="detail-header">
        <div>
          <h1>{project.name}</h1>
          {project.description && <p className="page-subtitle">{project.description}</p>}
        </div>
        <div className="detail-badges">
          <span className={`badge badge-${project.status}`}>{projStatusLabels[project.status]}</span>
          <span className={`badge-sm badge-${project.priority}`}>{priorityLabels[project.priority]}</span>
        </div>
      </div>

      {project.tags?.length > 0 && (
        <div className="tags-row" style={{ marginBottom: 24 }}>
          {project.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
        </div>
      )}

      {/* Kanban Board */}
      <div className="section-header" style={{ marginBottom: 16 }}>
        <h2>Tarefas ({tasks.length})</h2>
        <button onClick={() => setShowTaskForm(!showTaskForm)} className="btn-primary btn-icon">
          {showTaskForm ? '✕ Fechar' : '+ Nova Tarefa'}
        </button>
      </div>

      {showTaskForm && (
        <form onSubmit={handleAddTask} className="form-card">
          <div className="form-grid-2">
            <div className="form-group">
              <label>Título</label>
              <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Título da tarefa" required />
            </div>
            <div className="form-group">
              <label>Prazo</label>
              <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prioridade</label>
              <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
                {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Descrição</label>
              <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows="2" placeholder="Descrição..." />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary btn-icon">Criar Tarefa</button>
            <button type="button" onClick={() => setShowTaskForm(false)} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      )}

      <div className="kanban-board">
        {statusOrder.map(status => {
          const columnTasks = tasks.filter(t => t.status === status);
          return (
            <div key={status} className={`kanban-column kanban-${status}`}>
              <div className="kanban-header">
                <span className={`dot dot-${status}`}></span>
                <span>{statusLabels[status]}</span>
                <span className="kanban-count">{columnTasks.length}</span>
              </div>
              <div className="kanban-cards">
                {columnTasks.map(task => (
                  <div key={task._id} className={`kanban-card priority-border-${task.priority}`}>
                    <div className="kanban-card-title">{task.title}</div>
                    {task.description && <p className="kanban-card-desc">{task.description}</p>}
                    <div className="kanban-card-meta">
                      <span className={`badge-sm badge-${task.priority}`}>{priorityLabels[task.priority]}</span>
                      {task.dueDate && <span className="meta-text">📅 {new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>}
                    </div>
                    <div className="kanban-card-actions">
                      <select
                        value={task.status}
                        onChange={e => updateTaskStatus(task._id, e.target.value)}
                        className="status-select"
                      >
                        {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button onClick={() => deleteTask(task._id)} className="btn-xs btn-delete">🗑️</button>
                    </div>
                  </div>
                ))}
                {columnTasks.length === 0 && <div className="kanban-empty">Nenhuma tarefa</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectDetail;
