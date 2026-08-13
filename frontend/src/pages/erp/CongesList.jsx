import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, CheckCircle, XCircle, Clock, Trash2, X } from 'lucide-react';
import api from '../../services/api';

export default function CongesList() {
  const [data, setData] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employe_id: '',
    type_conge: 'paye',
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    nombre_jours: 1,
    motif: ''
  });

  useEffect(() => {
    fetchData();
    fetchEmployes();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/conges');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching conges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployes = async () => {
    try {
      const response = await api.get('/employes');
      const list = response.data?.data || response.data || [];
      setEmployes(list);
      if (list.length > 0) {
        setFormData(prev => ({ ...prev, employe_id: list[0].id }));
      }
    } catch (error) {
      console.error('Error fetching employes:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      employe_id: employes[0]?.id || '',
      type_conge: 'paye',
      date_debut: new Date().toISOString().split('T')[0],
      date_fin: new Date().toISOString().split('T')[0],
      nombre_jours: 1,
      motif: ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatut) => {
    try {
      await api.patch(`/conges/${id}/statut`, { statut: newStatut });
      fetchData();
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/conges', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Erreur lors de la création de la demande de congé.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de congé ?')) {
      try {
        await api.delete(`/conges/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const renderStatusBadge = (statut) => {
    switch (statut) {
      case 'approuve':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Approuvé
          </span>
        );
      case 'en_attente':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> En Attente
          </span>
        );
      case 'refuse':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={14} /> Refusé
          </span>
        );
      default:
        return statut;
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const empName = item.employe?.user ? `${item.employe.user.prenom || ''} ${item.employe.user.nom || ''}` : `Employé #${item.employe_id}`;
    return (
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type_conge?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.motif?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Gestion des Congés & Absences</h1>
          <p className="erp-page-subtitle">Suivez et validez les demandes de congés payés, maladie et absences du personnel.</p>
        </div>
        <button onClick={handleOpenModal} className="erp-btn-primary">
          <Plus size={18} /> Demander un Congé
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, type de congé ou motif..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted">Chargement...</div>
        ) : (
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type de Congé</th>
                  <th>Date Début</th>
                  <th>Date Fin</th>
                  <th>Durée</th>
                  <th>Statut</th>
                  <th>Motif</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted">
                      Aucune demande de congé trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const empName = item.employe?.user ? `${item.employe.user.prenom || ''} ${item.employe.user.nom || ''}`.trim() : `Employé #${item.employe_id}`;
                    return (
                      <tr key={item.id}>
                        <td>
                          <div className="font-bold text-slate-800">{empName}</div>
                          <div className="text-xs text-muted">{item.employe?.matricule}</div>
                        </td>
                        <td className="font-semibold text-blue-600">
                          {item.type_conge === 'paye' ? 'Congé Payé' : item.type_conge === 'maladie' ? 'Congé Maladie' : item.type_conge === 'maternite' ? 'Maternité' : 'Sans solde'}
                        </td>
                        <td>{item.date_debut}</td>
                        <td>{item.date_fin}</td>
                        <td className="font-bold text-slate-700">
                          {item.nombre_jours} jour{item.nombre_jours > 1 ? 's' : ''}
                        </td>
                        <td>{renderStatusBadge(item.statut)}</td>
                        <td className="text-muted text-xs">{item.motif || '-'}</td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          {item.statut === 'en_attente' && (
                            <>
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'approuve')}
                                style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                title="Approuver"
                              >
                                Approuver
                              </button>
                              <button 
                                onClick={() => handleUpdateStatus(item.id, 'refuse')}
                                style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                title="Refuser"
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(item.id)} className="erp-action-btn delete" title="Supprimer">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Demande de Congé */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '550px', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Nouvelle Demande de Congé
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="erp-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Sélectionner l'Employé *
                </label>
                <select 
                  className="glass-input"
                  required
                  value={formData.employe_id}
                  onChange={e => setFormData({ ...formData, employe_id: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                >
                  {employes.map(e => {
                    const name = e.user ? `${e.user.prenom || ''} ${e.user.nom || ''}`.trim() : `Matricule ${e.matricule}`;
                    return <option key={e.id} value={e.id}>{name} ({e.matricule})</option>;
                  })}
                </select>
              </div>

              <div className="erp-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Type de Congé *
                </label>
                <select 
                  className="glass-input"
                  required
                  value={formData.type_conge}
                  onChange={e => setFormData({ ...formData, type_conge: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px', fontWeight: 600 }}
                >
                  <option value="paye">Congé Payé</option>
                  <option value="maladie">Congé Maladie</option>
                  <option value="sans_solde">Congé Sans Solde</option>
                  <option value="maternite">Maternité / Paternité</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Date Début *
                  </label>
                  <input 
                    type="date"
                    className="glass-input"
                    required
                    value={formData.date_debut}
                    onChange={e => setFormData({ ...formData, date_debut: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Date Fin *
                  </label>
                  <input 
                    type="date"
                    className="glass-input"
                    required
                    value={formData.date_fin}
                    onChange={e => setFormData({ ...formData, date_fin: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Nombre Jours
                  </label>
                  <input 
                    type="number"
                    min="1"
                    className="glass-input"
                    required
                    value={formData.nombre_jours}
                    onChange={e => setFormData({ ...formData, nombre_jours: parseInt(e.target.value) || 1 })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div className="erp-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Motif du Congé
                </label>
                <textarea 
                  rows="2"
                  className="glass-input"
                  placeholder="Justification ou détails..."
                  value={formData.motif}
                  onChange={e => setFormData({ ...formData, motif: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="erp-btn-primary">
                  Soumettre la Demande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
