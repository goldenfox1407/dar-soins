import React, { useState, useEffect } from 'react';
import { Plus, Search, DollarSign, CheckCircle, Clock, Trash2, X, Eye, FileText, Download } from 'lucide-react';
import api from '../../services/api';

export default function PaieList() {
  const [data, setData] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employe_id: '',
    mois_annee: new Date().toISOString().slice(0, 7), // YYYY-MM
    salaire_base: 0,
    commissions_actes: 0,
    primes: 0,
    deductions: 0,
    statut_paiement: 'paye'
  });

  useEffect(() => {
    fetchData();
    fetchEmployes();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/fiches-paie');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching fiches-paie:', error);
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
        const first = list[0];
        setFormData(prev => ({
          ...prev,
          employe_id: first.id,
          salaire_base: first.salaire_base || 0,
          commissions_actes: first.mode_remuneration === 'par_acte' ? 3000 : 0
        }));
      }
    } catch (error) {
      console.error('Error fetching employes:', error);
    }
  };

  const handleEmployeSelect = (empId) => {
    const emp = employes.find(e => String(e.id) === String(empId));
    setFormData(prev => ({
      ...prev,
      employe_id: empId,
      salaire_base: emp?.salaire_base || 0,
      commissions_actes: emp?.mode_remuneration === 'par_acte' ? (emp.tarif_acte ? emp.tarif_acte * 20 : 3000) : 0
    }));
  };

  const handleOpenModal = () => {
    if (employes.length > 0) {
      const first = employes[0];
      setFormData({
        employe_id: first.id,
        mois_annee: new Date().toISOString().slice(0, 7),
        salaire_base: first.salaire_base || 0,
        commissions_actes: first.mode_remuneration === 'par_acte' ? (first.tarif_acte ? first.tarif_acte * 20 : 3000) : 0,
        primes: 0,
        deductions: 0,
        statut_paiement: 'paye'
      });
    }
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (id, newStatut) => {
    try {
      await api.patch(`/fiches-paie/${id}/statut`, { statut_paiement: newStatut });
      fetchData();
      if (selectedFiche && selectedFiche.id === id) {
        setSelectedFiche({ ...selectedFiche, statut_paiement: newStatut });
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du paiement.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fiches-paie', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Erreur lors de la génération de la fiche de paie.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette fiche de paie ?')) {
      try {
        await api.delete(`/fiches-paie/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const calculatePreviewNet = () => {
    const base = parseFloat(formData.salaire_base) || 0;
    const comm = parseFloat(formData.commissions_actes) || 0;
    const prime = parseFloat(formData.primes) || 0;
    const ded = parseFloat(formData.deductions) || 0;
    return Math.max(0, (base + comm + prime) - ded);
  };

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const empName = item.employe?.user ? `${item.employe.user.prenom || ''} ${item.employe.user.nom || ''}` : `Employé #${item.employe_id}`;
    return (
      item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mois_annee?.includes(searchTerm)
    );
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Gestion de la Paie</h1>
          <p className="erp-page-subtitle">Générez les bulletins de salaire, primes et rémunérations par acte.</p>
        </div>
        <button onClick={handleOpenModal} className="erp-btn-primary">
          <Plus size={18} /> Générer une Fiche de Paie
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, employé ou mois (YYYY-MM)..." 
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
                  <th>Référence</th>
                  <th>Employé</th>
                  <th>Mois</th>
                  <th>Salaire Base</th>
                  <th>Actes / Comm.</th>
                  <th>Primes / Déd.</th>
                  <th>Salaire Net</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-muted">
                      Aucune fiche de paie générée.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const empName = item.employe?.user ? `${item.employe.user.prenom || ''} ${item.employe.user.nom || ''}`.trim() : `Employé #${item.employe_id}`;
                    return (
                      <tr key={item.id}>
                        <td className="font-bold text-blue-600">{item.reference}</td>
                        <td>
                          <div className="font-bold text-slate-800">{empName}</div>
                          <div className="text-xs text-muted">
                            {item.employe?.mode_remuneration === 'par_acte' ? 'Soin par acte' : 'Salarié fixe'}
                          </div>
                        </td>
                        <td className="font-semibold text-slate-700">{item.mois_annee}</td>
                        <td>{Number(item.salaire_base).toFixed(2)} MAD</td>
                        <td className="font-semibold text-purple-600">
                          {Number(item.commissions_actes).toFixed(2)} MAD
                        </td>
                        <td className="text-xs">
                          <span className="text-emerald-600">+{Number(item.primes).toFixed(2)}</span> / <span className="text-rose-600">-{Number(item.deductions).toFixed(2)}</span>
                        </td>
                        <td className="font-bold text-emerald-600" style={{ fontSize: '1rem' }}>
                          {Number(item.salaire_net).toFixed(2)} MAD
                        </td>
                        <td>
                          {item.statut_paiement === 'paye' ? (
                            <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={14} /> Payé
                            </span>
                          ) : (
                            <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={14} /> En Attente
                            </span>
                          )}
                        </td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button onClick={() => { setSelectedFiche(item); setIsDetailsOpen(true); }} className="erp-action-btn view" title="Voir détails">
                            <Eye size={18} />
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

      {/* Details Modal */}
      {isDetailsOpen && selectedFiche && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '600px', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Bulletin de Paie {selectedFiche.reference}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  Période: {selectedFiche.mois_annee}
                </p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Employé:</span>
                <span style={{ fontWeight: 700, color: '#1e293b' }}>
                  {selectedFiche.employe?.user ? `${selectedFiche.employe.user.prenom || ''} ${selectedFiche.employe.user.nom || ''}`.trim() : `Matricule ${selectedFiche.employe?.matricule}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#64748b', fontWeight: 600 }}>Mode Rémunération:</span>
                <span style={{ fontWeight: 700, color: '#2563eb' }}>
                  {selectedFiche.employe?.mode_remuneration === 'par_acte' ? 'Rémunération par Acte' : 'Salaire Fixe Mensuel'}
                </span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span>Salaire de Base:</span>
                <span>{Number(selectedFiche.salaire_base).toFixed(2)} MAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span>Actes / Commissions Soins:</span>
                <span style={{ color: '#9333ea', fontWeight: 600 }}>+{Number(selectedFiche.commissions_actes).toFixed(2)} MAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span>Primes & Indemnités:</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>+{Number(selectedFiche.primes).toFixed(2)} MAD</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                <span>Déductions & Cotisations:</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>-{Number(selectedFiche.deductions).toFixed(2)} MAD</span>
              </div>

              <hr style={{ border: 'none', borderTop: '2px solid #0f172a', margin: '12px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
                <span style={{ color: '#0f172a' }}>NET À PAYER :</span>
                <span style={{ color: '#16a34a' }}>{Number(selectedFiche.salaire_net).toFixed(2)} MAD</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => handleUpdateStatus(selectedFiche.id, 'paye')}
                  style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Marquer Payé
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedFiche.id, 'en_attente')}
                  style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  En attente
                </button>
              </div>

              <button onClick={() => setIsDetailsOpen(false)} className="erp-btn-secondary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Generation */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '550px', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                Générer un Bulletin de Paie
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Employé *
                  </label>
                  <select 
                    className="glass-input"
                    required
                    value={formData.employe_id}
                    onChange={e => handleEmployeSelect(e.target.value)}
                    style={{ color: '#1e293b', padding: '10px' }}
                  >
                    {employes.map(e => {
                      const name = e.user ? `${e.user.prenom || ''} ${e.user.nom || ''}`.trim() : `Matricule ${e.matricule}`;
                      return <option key={e.id} value={e.id}>{name} ({e.mode_remuneration === 'par_acte' ? 'Par acte' : 'Salarié'})</option>;
                    })}
                  </select>
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Mois & Année *
                  </label>
                  <input 
                    type="month"
                    className="glass-input"
                    required
                    value={formData.mois_annee}
                    onChange={e => setFormData({ ...formData, mois_annee: e.target.value })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Salaire de Base (MAD)
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

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Actes / Commissions Soins (MAD)
                  </label>
                  <input 
                    type="number"
                    step="50"
                    className="glass-input"
                    value={formData.commissions_actes}
                    onChange={e => setFormData({ ...formData, commissions_actes: parseFloat(e.target.value) || 0 })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Primes (MAD)
                  </label>
                  <input 
                    type="number"
                    step="50"
                    className="glass-input"
                    value={formData.primes}
                    onChange={e => setFormData({ ...formData, primes: parseFloat(e.target.value) || 0 })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>

                <div className="erp-form-group">
                  <label style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px', display: 'block' }}>
                    Déductions / Avances (MAD)
                  </label>
                  <input 
                    type="number"
                    step="50"
                    className="glass-input"
                    value={formData.deductions}
                    onChange={e => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                    style={{ color: '#1e293b', padding: '10px' }}
                  />
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, color: '#166534' }}>Salaire Net Calculé :</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#15803d' }}>
                  {calculatePreviewNet().toFixed(2)} MAD
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="erp-btn-primary">
                  Générer le Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
