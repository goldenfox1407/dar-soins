import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, Edit, Trash2, X, Briefcase, Phone, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

export default function EmployesList() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    user_id: '',
    type_employe: 'gestionnaire',
    mode_remuneration: 'salarie',
    salaire_base: 5000,
    tarif_acte: 150,
    cin: '',
    telephone: '',
    date_embauche: new Date().toISOString().split('T')[0],
    statut: 'actif'
  });

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/employes');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching employes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      user_id: '',
      type_employe: 'gestionnaire',
      mode_remuneration: 'salarie',
      salaire_base: 5000,
      tarif_acte: 150,
      cin: '',
      telephone: '',
      date_embauche: new Date().toISOString().split('T')[0],
      statut: 'actif'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingId(emp.id);
    setFormData({
      user_id: emp.user_id || '',
      type_employe: emp.type_employe || 'gestionnaire',
      mode_remuneration: emp.mode_remuneration || 'salarie',
      salaire_base: emp.salaire_base || 0,
      tarif_acte: emp.tarif_acte || 0,
      cin: emp.cin || '',
      telephone: emp.telephone || '',
      date_embauche: emp.date_embauche || new Date().toISOString().split('T')[0],
      statut: emp.statut || 'actif'
    });
    setIsModalOpen(true);
  };

  const handleTypeChange = (type) => {
    let mode = 'salarie';
    if (type === 'infirmier_soins') {
      mode = 'par_acte';
    }
    setFormData({
      ...formData,
      type_employe: type,
      mode_remuneration: mode
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/employes/${editingId}`, formData);
      } else {
        await api.post('/employes', formData);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Erreur lors de l'enregistrement de l'employé.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche employé ?')) {
      try {
        await api.delete(`/employes/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const renderTypeBadge = (type) => {
    switch (type) {
      case 'gestionnaire':
        return (
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
            💼 Gestionnaire Salarié
          </span>
        );
      case 'infirmier_soins':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
            🩺 Infirmier Soins (Par Acte)
          </span>
        );
      case 'infirmier_garde':
        return (
          <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700 }}>
            🌙 Infirmier Gardes (Salarié)
          </span>
        );
      default:
        return type;
    }
  };

  const renderRemunBadge = (mode) => {
    if (mode === 'par_acte') {
      return <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>Par Acte</span>;
    }
    return <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>Salarié (Fixe)</span>;
  };

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const name = item.user ? `${item.user.prenom || ''} ${item.user.nom || ''}` : '';
    return item.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           item.cin?.toLowerCase().includes(searchTerm.toLowerCase());
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Gestion des Employés RH</h1>
          <p className="erp-page-subtitle">Gérez les fiches du personnel, gestionnaires et infirmiers (Par acte / Salarié).</p>
        </div>
        <button onClick={handleOpenCreateModal} className="erp-btn-primary">
          <Plus size={18} /> Ajouter un Employé
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, matricule ou CIN..." 
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
                  <th>Matricule</th>
                  <th>Nom & Prénom</th>
                  <th>Poste & Type</th>
                  <th>Rémunération</th>
                  <th>Salaire / Tarif Acte</th>
                  <th>Téléphone</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-muted">
                      Aucun employé trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const userName = item.user ? `${item.user.prenom || ''} ${item.user.nom || ''}`.trim() : 'Employé Externe';
                    return (
                      <tr key={item.id}>
                        <td className="font-bold text-blue-600">{item.matricule}</td>
                        <td>
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <UserCheck size={16} className="text-blue-500" />
                            {userName}
                          </div>
                          {item.user?.email && <div className="text-xs text-muted">{item.user.email}</div>}
                        </td>
                        <td>{renderTypeBadge(item.type_employe)}</td>
                        <td>{renderRemunBadge(item.mode_remuneration)}</td>
                        <td className="font-bold text-slate-700">
                          {item.mode_remuneration === 'par_acte' 
                            ? `${Number(item.tarif_acte).toFixed(2)} MAD / acte`
                            : `${Number(item.salaire_base).toFixed(2)} MAD / mois`}
                        </td>
                        <td>{item.telephone || '-'}</td>
                        <td>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            background: item.statut === 'actif' ? '#dcfce7' : item.statut === 'en_conge' ? '#fef3c7' : '#fee2e2',
                            color: item.statut === 'actif' ? '#15803d' : item.statut === 'en_conge' ? '#b45309' : '#b91c1c'
                          }}>
                            {item.statut === 'actif' ? 'Actif' : item.statut === 'en_conge' ? 'En Congé' : 'Inactif'}
                          </span>
                        </td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button onClick={() => handleOpenEditModal(item)} className="erp-action-btn edit" title="Modifier">
                            <Edit size={18} />
                          </button>
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

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '650px', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                {editingId ? "Modifier la Fiche Employé" : "Ajouter un Nouvel Employé"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="erp-form-group">
                <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                  Compte Utilisateur Lié (Optionnel)
                </label>
                <select 
                  className="glass-input"
                  value={formData.user_id}
                  onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                  style={{ color: '#1e293b', padding: '10px' }}
                >
                  <option value="">-- Aucun compte (Employé externe) --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.prenom || ''} {u.nom || ''} ({u.email}) - Role: {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Type d'Employé *
                  </label>
                  <select 
                    className="glass-input"
                    required
                    value={formData.type_employe}
                    onChange={e => handleTypeChange(e.target.value)}
                    style={{ color: '#1e293b', padding: '10px', fontWeight: 600 }}
                  >
                    <option value="gestionnaire">💼 Gestionnaire (Administratif)</option>
                    <option value="infirmier_soins">🩺 Infirmier des Soins (À domicile)</option>
                    <option value="infirmier_garde">🌙 Infirmier des Gardes (Permanence)</option>
                  </select>
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Mode de Rémunération *
                  </label>
                  <select 
                    className="glass-input"
                    required
                    value={formData.mode_remuneration}
                    onChange={e => setFormData({ ...formData, mode_remuneration: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px', fontWeight: 600 }}
                  >
                    <option value="salarie">Fixe Mensuel (Salarié)</option>
                    <option value="par_acte">Par Acte / Soin effectué</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {formData.mode_remuneration === 'salarie' ? (
                  <div className="erp-form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                      Salaire de Base Mensuel (MAD)
                    </label>
                    <input 
                      type="number"
                      step="100"
                      className="glass-input"
                      value={formData.salaire_base}
                      onChange={e => setFormData({ ...formData, salaire_base: parseFloat(e.target.value) || 0 })}
                      style={{ color: '#1e293b', padding: '10px' }}
                    />
                  </div>
                ) : (
                  <div className="erp-form-group">
                    <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                      Tarif / Commission par Acte (MAD)
                    </label>
                    <input 
                      type="number"
                      step="10"
                      className="glass-input"
                      value={formData.tarif_acte}
                      onChange={e => setFormData({ ...formData, tarif_acte: parseFloat(e.target.value) || 0 })}
                      style={{ color: '#1e293b', padding: '10px' }}
                    />
                  </div>
                )}

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    N° CIN
                  </label>
                  <input 
                    type="text"
                    className="glass-input"
                    placeholder="ex: AB123456"
                    value={formData.cin}
                    onChange={e => setFormData({ ...formData, cin: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Téléphone
                  </label>
                  <input 
                    type="text"
                    className="glass-input"
                    placeholder="+212 600 000 000"
                    value={formData.telephone}
                    onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Date d'Embauche
                  </label>
                  <input 
                    type="date"
                    className="glass-input"
                    value={formData.date_embauche}
                    onChange={e => setFormData({ ...formData, date_embauche: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Statut
                  </label>
                  <select 
                    className="glass-input"
                    value={formData.statut}
                    onChange={e => setFormData({ ...formData, statut: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    <option value="actif">Actif</option>
                    <option value="en_conge">En Congé</option>
                    <option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="erp-btn-primary">
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
