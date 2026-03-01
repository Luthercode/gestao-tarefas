import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/projects/stats'),
          api.get('/tasks?limit=5&sort=-createdAt')
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">Carregando dashboard...</div>;

  const statusLabels = {
    'planejamento': 'Planejamento',
    'em-andamento': 'Em Andamento',
    'pausado': 'Pausado',
    'concluido': 'Concluído',
    'cancelado': 'Cancelado'
  };

  const taskStatusLabels = { todo: 'A Fazer', 'in-progress': 'Em Progresso', review: 'Revisão', done: 'Concluída' };
  const priorityLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Visão geral dos seus projetos e tarefas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalProjects || 0}</span>
            <span className="stat-label">Projetos</span>
          </div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.totalTasks || 0}</span>
            <span className="stat-label">Tarefas</span>
          </div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.completedTasks || 0}</span>
            <span className="stat-label">Concluídas</span>
          </div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <span className="stat-value">{stats?.completionRate || 0}%</span>
            <span className="stat-label">Conclusão</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Projects by Status */}
        <div className="dash-section">
          <h3>Projetos por Status</h3>
          <div className="status-bars">
            {Object.entries(statusLabels).map(([key, label]) => {
              const count = stats?.byStatus?.[key] || 0;
              const total = stats?.totalProjects || 1;
              const pct = Math.round((count / total) * 100);
              return (
                <div key={key} className="bar-row">
                  <span className="bar-label">{label}</span>
                  <div className="bar-track">
                    <div className={`bar-fill bar-${key}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dash-section">
          <div className="section-header">
            <h3>Tarefas Recentes</h3>
            <Link to="/tasks" className="link-sm">Ver todas →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="empty-text">Nenhuma tarefa ainda</p>
          ) : (
            <div className="task-list-compact">
              {recentTasks.map(task => (
                <div key={task._id} className="task-item-compact">
                  <div className="task-item-left">
                    <span className={`dot dot-${task.status}`}></span>
                    <span className="task-title-sm">{task.title}</span>
                  </div>
                  <div className="task-item-right">
                    <span className={`badge-sm badge-${task.priority}`}>{priorityLabels[task.priority]}</span>
                    <span className="task-status-sm">{taskStatusLabels[task.status]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
