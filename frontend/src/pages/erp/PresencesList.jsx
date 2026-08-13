import React, { useState, useEffect } from 'react';
import { Plus, Search, Calendar, Clock, CheckCircle, AlertTriangle, XCircle, Trash2, X } from 'lucide-react';
import api from '../../services/api';

export default function PresencesList() {
  const [data, setData] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employe_id: '',
    date: new Date().toISOString().split('T')[0],
    heure_arrivee: '08:30',
    heure_depart: '17:00',
    statut: 'present',
    notes: ''
  });

  useEffect(() => {
    fetchData();
    fetchEmployes();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/presences');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching presences:', error);
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
      date: selectedDate,
      heure_arrivee: '08:30',
      heure_depart: '17:00',
      statut: 'present',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/presences', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Erreur lors de l'enregistrement du pointage.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement de présence ?')) {
      try {
        await api.delete(`/presences/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const renderStatusBadge = (statut) => {
    switch (statut) {
      case 'present':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Présent
          </span>
        );
      case 'retard':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={14} /> Retard
          </span>
        );
      case 'demi_journee':
        return (
          <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> Demi-journée
          </span>
        );
      case 'absent':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={14} /> Absent
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
      item.employe?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.date?.includes(searchTerm)
    );
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Pointage & Présences</h1>
          <p className="erp-page-subtitle">Suivez l'assiduité, les heures d'arrivée et de départ du personnel.</p>
        </div>
        <button onClick={handleOpenModal} className="erp-btn-primary">
          <Plus size={18} /> Pointer un Employé
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom d'employé ou matricule..." 
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
                  <th>Date</th>
                  <th>Employé</th>
                  <th>Poste</th>
                  <th>Heure d'Arrivée</th>
                  <th>Heure de Départ</th>
                  <th>Statut</th>
                  <th>Remarques</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted">
                      Aucune présence enregistrée.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const empName = item.employe?.user ? `${item.employe.user.prenom || ''} ${item.employe.user.nom || ''}`.trim() : `Employé #${item.employe_id}`;
                    return (
                      <tr key={item.id}>
                        <td className="font-bold text-slate-700">{item.date}</td>
                        <td>
                          <div className="font-bold text-slate-800">{empName}</div>
                          <div className="text-xs text-muted">{item.employe?.matricule}</div>
                        </td>
                        <td className="text-xs font-semibold text-slate-600">
                          {item.employe?.type_employe === 'gestionnaire' ? 'Gestionnaire' : item.employe?.type_employe === 'infirmier_soins' ? 'Infirmier Soins' : 'Infirmier Garde'}
                        </td>
                        <td className="font-semibold text-blue-600">{item.heure_arrivee || '-'}</td>
                        <td className="font-semibold text-blue-600">{item.heure_depart || '-'}</td>
                        <td>{renderStatusBadge(item.statut)}</td>
                        <td className="text-muted text-xs">{item.notes || '-'}</td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
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

      {/* Modal Pointage */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '500px', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Pointage de Présence
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="erp-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Sélectionner un Employé *
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Date *
                  </label>
                  <input 
                    type="date"
                    className="glass-input"
                    required
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Statut *
                  </label>
                  <select 
                    className="glass-input"
                    required
                    value={formData.statut}
                    onChange={e => setFormData({ ...formData, statut: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px', fontWeight: 600 }}
                  >
                    <option value="present">Présent</option>
                    <option value="retard">Retard</option>
                    <option value="demi_journee">Demi-journée</option>
                    <option value="absent">Absent</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Heure d'Arrivée
                  </label>
                  <input 
                    type="time"
                    className="glass-input"
                    value={formData.heure_arrivee}
                    onChange={e => setFormData({ ...formData, heure_arrivee: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Heure de Départ
                  </label>
                  <input 
                    type="time"
                    className="glass-input"
                    value={formData.heure_depart}
                    onChange={e => setFormData({ ...formData, heure_depart: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div className="erp-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Notes / Remarques
                </label>
                <textarea 
                  rows="2"
                  className="glass-input"
                  placeholder="Remarques éventuelles..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="erp-btn-primary">
                  Enregistrer Pointage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
