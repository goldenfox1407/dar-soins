import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle, Clock, AlertTriangle, Circle, Trash2, X, Edit, Flag, User, Calendar } from 'lucide-react';
import api from '../../services/api';

const PRIORITE_CONFIG = {
  basse: { label: 'Basse', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)' },
  moyenne: { label: 'Moyenne', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  haute: { label: 'Haute', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  urgente: { label: 'Urgente', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
};

const STATUT_CONFIG = {
  a_faire: { label: 'À faire', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: Circle },
  en_cours: { label: 'En cours', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Clock },
  termine: { label: 'Terminé', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', icon: CheckCircle },
};

const STATUT_FLOW = ['a_faire', 'en_cours', 'termine'];

export default function TachesList() {
  const [data, setData] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('tous');
  const [filterPriorite, setFilterPriorite] = useState('toutes');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    employe_id: '',
    priorite: 'moyenne',
    statut: 'a_faire',
    date_echeance: '',
    couleur: '',
  });

  useEffect(() => {
    fetchData();
    fetchEmployes();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/taches');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching taches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await api.get('/employes');
      setEmployes(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching employes:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      titre: '',
      description: '',
      employe_id: '',
      priorite: 'moyenne',
      statut: 'a_faire',
      date_echeance: '',
      couleur: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tache) => {
    setEditingId(tache.id);
    setFormData({
      titre: tache.titre || '',
      description: tache.description || '',
      employe_id: tache.employe_id || '',
      priorite: tache.priorite || 'moyenne',
      statut: tache.statut || 'a_faire',
      date_echeance: tache.date_echeance ? tache.date_echeance.split('T')[0] : '',
      couleur: tache.couleur || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.employe_id) delete payload.employe_id;
      if (!payload.date_echeance) delete payload.date_echeance;
      if (!payload.couleur) delete payload.couleur;

      if (editingId) {
        await api.put(`/taches/${editingId}`, payload);
      } else {
        await api.post('/taches', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving tache:', error);
      alert('Erreur lors de l\'enregistrement de la tâche');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette tâche ?')) return;
    try {
      await api.delete(`/taches/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting tache:', error);
    }
  };

  const handleStatutChange = async (tache) => {
    const currentIdx = STATUT_FLOW.indexOf(tache.statut);
    const nextStatut = STATUT_FLOW[(currentIdx + 1) % STATUT_FLOW.length];
    try {
      await api.patch(`/taches/${tache.id}/statut`, { statut: nextStatut });
      fetchData();
    } catch (error) {
      console.error('Error updating statut:', error);
    }
  };

  // Filtered data
  const filtered = data.filter(t => {
    const matchSearch = t.titre?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filterStatut === 'tous' || t.statut === filterStatut;
    const matchPriorite = filterPriorite === 'toutes' || t.priorite === filterPriorite;
    return matchSearch && matchStatut && matchPriorite;
  });

  // Stats
  const stats = {
    total: data.length,
    a_faire: data.filter(t => t.statut === 'a_faire').length,
    en_cours: data.filter(t => t.statut === 'en_cours').length,
    termine: data.filter(t => t.statut === 'termine').length,
  };

  const getEmployeName = (tache) => {
    if (tache.employe?.user) {
      return `${tache.employe.user.prenom || ''} ${tache.employe.user.name || ''}`.trim();
    }
    return 'Non assigné';
  };

  const isOverdue = (tache) => {
    if (!tache.date_echeance || tache.statut === 'termine') return false;
    return new Date(tache.date_echeance) < new Date(new Date().toDateString());
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Stats Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#8b5cf6', icon: Flag },
          { label: 'À faire', value: stats.a_faire, color: '#94a3b8', icon: Circle },
          { label: 'En cours', value: stats.en_cours, color: '#3b82f6', icon: Clock },
          { label: 'Terminées', value: stats.termine, color: '#22c55e', icon: CheckCircle },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ padding: '1.2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `${s.color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.icon size={22} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Panel */}
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Tâches</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>Gérez et organisez vos tâches d'équipe</p>
          </div>
          <button className="erp-btn-primary" onClick={handleOpenCreateModal} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Plus size={18} /> Nouvelle Tâche
          </button>
        </header>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 250px' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              className="glass-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 40, color: '#1e293b', width: '100%' }}
            />
          </div>
          <select
            className="glass-input"
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            style={{ color: '#1e293b', padding: '10px 14px', minWidth: 150 }}
          >
            <option value="tous">Tous les statuts</option>
            <option value="a_faire">À faire</option>
            <option value="en_cours">En cours</option>
            <option value="termine">Terminé</option>
          </select>
          <select
            className="glass-input"
            value={filterPriorite}
            onChange={e => setFilterPriorite(e.target.value)}
            style={{ color: '#1e293b', padding: '10px 14px', minWidth: 150 }}
          >
            <option value="toutes">Toutes priorités</option>
            <option value="basse">Basse</option>
            <option value="moyenne">Moyenne</option>
            <option value="haute">Haute</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        {/* Task List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Chargement...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Flag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem' }}>Aucune tâche trouvée</p>
            <p style={{ fontSize: '0.85rem' }}>Créez votre première tâche pour commencer</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((tache) => {
              const prio = PRIORITE_CONFIG[tache.priorite] || PRIORITE_CONFIG.moyenne;
              const stat = STATUT_CONFIG[tache.statut] || STATUT_CONFIG.a_faire;
              const StatIcon = stat.icon;
              const overdue = isOverdue(tache);

              return (
                <div key={tache.id} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${overdue ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12,
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  {/* Left color indicator */}
                  <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
                    background: prio.color, borderRadius: '12px 0 0 12px',
                  }} />

                  {/* Status toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStatutChange(tache); }}
                    title={`Cliquer pour passer au statut suivant`}
                    style={{
                      background: stat.bg, border: 'none', borderRadius: 8,
                      width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'transform 0.2s', flexShrink: 0,
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <StatIcon size={20} color={stat.color} />
                  </button>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        fontSize: '1rem', fontWeight: 600,
                        color: tache.statut === 'termine' ? 'var(--text-muted)' : 'var(--text-primary)',
                        textDecoration: tache.statut === 'termine' ? 'line-through' : 'none',
                      }}>
                        {tache.titre}
                      </span>
                      {overdue && (
                        <span style={{
                          fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20,
                          background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 600,
                        }}>
                          En retard
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {/* Priority badge */}
                      <span style={{
                        padding: '2px 10px', borderRadius: 20,
                        background: prio.bg, color: prio.color,
                        fontWeight: 600, fontSize: '0.75rem',
                      }}>
                        {prio.label}
                      </span>

                      {/* Assignee */}
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <User size={14} /> {getEmployeName(tache)}
                      </span>

                      {/* Due date */}
                      {tache.date_echeance && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: overdue ? '#ef4444' : 'var(--text-muted)' }}>
                          <Calendar size={14} />
                          {new Date(tache.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}

                      {/* Status label */}
                      <span style={{
                        padding: '2px 10px', borderRadius: 20,
                        background: stat.bg, color: stat.color,
                        fontWeight: 600, fontSize: '0.75rem',
                      }}>
                        {stat.label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenEditModal(tache); }}
                      style={{
                        background: 'rgba(59,130,246,0.1)', border: 'none', borderRadius: 8,
                        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(59,130,246,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(59,130,246,0.1)'}
                    >
                      <Edit size={16} color="#3b82f6" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(tache.id); }}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 8,
                        width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', transition: 'background 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Create/Edit */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }} onClick={() => setIsModalOpen(false)}>
          <div style={{
            background: '#fff', borderRadius: 16,
            width: '90%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' }}>
                {editingId ? 'Modifier la Tâche' : 'Nouvelle Tâche'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{
                background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: 8,
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem' }}>
              <div className="erp-form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                  Titre *
                </label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Titre de la tâche"
                  value={formData.titre}
                  onChange={e => setFormData({ ...formData, titre: e.target.value })}
                  required
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div className="erp-form-group" style={{ marginBottom: '1.2rem' }}>
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                  Description
                </label>
                <textarea
                  rows="3"
                  className="glass-input"
                  placeholder="Description détaillée..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                    Priorité *
                  </label>
                  <select
                    className="glass-input"
                    value={formData.priorite}
                    onChange={e => setFormData({ ...formData, priorite: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    <option value="basse">🟢 Basse</option>
                    <option value="moyenne">🔵 Moyenne</option>
                    <option value="haute">🟡 Haute</option>
                    <option value="urgente">🔴 Urgente</option>
                  </select>
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                    Statut *
                  </label>
                  <select
                    className="glass-input"
                    value={formData.statut}
                    onChange={e => setFormData({ ...formData, statut: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    <option value="a_faire">À faire</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.2rem' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                    Assigné à
                  </label>
                  <select
                    className="glass-input"
                    value={formData.employe_id}
                    onChange={e => setFormData({ ...formData, employe_id: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    <option value="">— Non assigné —</option>
                    {employes.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.user ? `${emp.user.prenom || ''} ${emp.user.name || ''}`.trim() : `Employé #${emp.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: 6, display: 'block' }}>
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    className="glass-input"
                    value={formData.date_echeance}
                    onChange={e => setFormData({ ...formData, date_echeance: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="erp-btn-primary">
                  {editingId ? 'Enregistrer' : 'Créer la Tâche'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
