import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({ name: '', description: '', status: 'planejamento', priority: 'media', deadline: '', tags: '' });

  const fetchProjects = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      params.limit = 50;
      const res = await api.get('/projects', { params });
      setProjects(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [search, filterStatus]);

  const resetForm = () => {
    setForm({ name: '', description: '', status: 'planejamento', priority: 'media', deadline: '', tags: '' });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    };
    try {
      if (editId) {
        await api.put(`/projects/${editId}`, payload);
      } else {
        await api.post('/projects', payload);
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '',
      status: p.status, priority: p.priority,
      deadline: p.deadline ? p.deadline.split('T')[0] : '',
      tags: p.tags?.join(', ') || ''
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remover projeto e todas as suas tarefas?')) return;
    await api.delete(`/projects/${id}`);
    fetchProjects();
  };

  const statusLabels = {
    'planejamento': 'Planejamento', 'em-andamento': 'Em Andamento',
    'pausado': 'Pausado', 'concluido': 'Concluído', 'cancelado': 'Cancelado'
  };
  const priorityLabels = { baixa: 'Baixa', media: 'Média', alta: 'Alta', urgente: 'Urgente' };

  if (loading) return <div className="loading">Carregando projetos...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projetos</h1>
          <p className="page-subtitle">{projects.length} projeto(s)</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn-primary btn-icon">
          {showForm ? '✕ Fechar' : '+ Novo Projeto'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <h3>{editId ? 'Editar Projeto' : 'Novo Projeto'}</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Nome</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do projeto" required />
            </div>
            <div className="form-group">
              <label>Prazo</label>
              <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Prioridade</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Descrição</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva o projeto..." rows="2" />
            </div>
            <div className="form-group full">
              <label>Tags (separadas por vírgula)</label>
              <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="frontend, design, api" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary btn-icon">{editId ? 'Salvar' : 'Criar'}</button>
            <button type="button" onClick={resetForm} className="btn-ghost">Cancelar</button>
          </div>
        </form>
      )}

      <div className="filters-row">
        <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar projetos..." />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum projeto encontrado</p>
          <button onClick={() => setShowForm(true)} className="btn-primary btn-icon">+ Criar Projeto</button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => (
            <div key={p._id} className={`project-card priority-border-${p.priority}`}>
              <div className="project-card-top">
                <Link to={`/projects/${p._id}`} className="project-name">{p.name}</Link>
                <span className={`badge badge-${p.status}`}>{statusLabels[p.status]}</span>
              </div>
              {p.description && <p className="project-desc">{p.description}</p>}
              <div className="project-meta">
                <span className={`badge-sm badge-${p.priority}`}>{priorityLabels[p.priority]}</span>
                {p.deadline && <span className="meta-text">📅 {new Date(p.deadline).toLocaleDateString('pt-BR')}</span>}
              </div>
              {p.tags?.length > 0 && (
                <div className="tags-row">
                  {p.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}
                </div>
              )}
              <div className="project-actions">
                <button onClick={() => handleEdit(p)} className="btn-sm btn-edit">Editar</button>
                <button onClick={() => handleDelete(p._id)} className="btn-sm btn-delete">Remover</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
