import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Eye, Trash2, X, CheckCircle, Clock, AlertTriangle, ShieldCheck, Printer, Calendar, User, HeartPulse } from 'lucide-react';
import api from '../../services/api';

export default function ContratsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContrat, setSelectedContrat] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/contrats');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching contrats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatut) => {
    try {
      await api.patch(`/contrats/${id}/statut`, { statut: newStatut });
      fetchData();
      if (selectedContrat && selectedContrat.id === id) {
        setSelectedContrat({ ...selectedContrat, statut: newStatut });
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut du contrat.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contrat de garde ?')) {
      try {
        await api.delete(`/contrats/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleShowDetails = (contrat) => {
    setSelectedContrat(contrat);
    setIsModalOpen(true);
  };

  const renderTypeGardeBadge = (type) => {
    switch (type) {
      case 'nuit':
        return (
          <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🌙 Garde de Nuit (20h-08h)
          </span>
        );
      case 'jour':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            ☀️ Garde de Jour (08h-20h)
          </span>
        );
      case '24h':
        return (
          <span style={{ background: '#f3e8ff', color: '#6b21a8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            ⏳ Garde Continue 24h/24
          </span>
        );
      case 'post_operatoire':
        return (
          <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            🏥 Soins Post-opératoires
          </span>
        );
      case 'accompagnement_senior':
        return (
          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            👵 Accompagnement Senior
          </span>
        );
      default:
        return type;
    }
  };

  const renderStatusBadge = (statut) => {
    switch (statut) {
      case 'actif':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> En cours (Actif)
          </span>
        );
      case 'en_attente':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> En Attente
          </span>
        );
      case 'termine':
        return (
          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={14} /> Terminé
          </span>
        );
      case 'resilie':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={14} /> Résilié
          </span>
        );
      default:
        return statut;
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item => {
    const clientName = item.client?.user ? `${item.client.user.prenom || ''} ${item.client.user.nom || ''}` : '';
    const infName = item.infirmier?.user ? `${item.infirmier.user.prenom || ''} ${item.infirmier.user.nom || ''}` : '';
    return (
      item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type_garde?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Contrats de Garde Médicale</h1>
          <p className="erp-page-subtitle">Gérez les contrats de services de garde à domicile selon les besoins spécifiques du patient.</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/contrats/ajouter')} className="erp-btn-primary">
          <Plus size={18} /> Nouveau Contrat de Garde
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, patient, infirmier ou cas de garde..." 
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
                  <th>Patient / Client</th>
                  <th>Infirmier Affecté</th>
                  <th>Cas de Garde</th>
                  <th>Période</th>
                  <th>Tarif / Jour</th>
                  <th>Montant Total</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-muted">
                      Aucun contrat de garde trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => {
                    const clientName = item.client?.user ? `${item.client.user.prenom || ''} ${item.client.user.nom || ''}`.trim() : `Client #${item.client_id}`;
                    const infName = item.infirmier?.user ? `${item.infirmier.user.prenom || ''} ${item.infirmier.user.nom || ''}`.trim() : 'En attente d\'affectation';
                    return (
                      <tr key={item.id}>
                        <td className="font-bold text-blue-600">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-blue-500" />
                            {item.reference}
                          </div>
                        </td>
                        <td>
                          <div className="font-bold text-slate-800">{clientName}</div>
                          {item.client?.telephone && <div className="text-xs text-muted">{item.client.telephone}</div>}
                        </td>
                        <td>
                          <div className="font-semibold text-slate-700">{infName}</div>
                        </td>
                        <td>{renderTypeGardeBadge(item.type_garde)}</td>
                        <td className="text-xs font-medium">
                          {item.date_debut} ➔ {item.date_fin}
                        </td>
                        <td>{Number(item.tarif_journalier).toFixed(2)} MAD</td>
                        <td className="font-bold text-emerald-600">
                          {Number(item.montant_total).toFixed(2)} MAD
                        </td>
                        <td>{renderStatusBadge(item.statut)}</td>
                        <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button onClick={() => handleShowDetails(item)} className="erp-action-btn view" title="Voir le contrat détaillé">
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

      {/* Details & PDF Contract Modal */}
      {isModalOpen && selectedContrat && createPortal(
        <div 
          onClick={() => setIsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto',
            padding: '70px 16px 40px 16px',
            zIndex: 999999
          }}
        >
          <div 
            className="glass-panel custom-scrollbar animate-scale-in"
            onClick={e => e.stopPropagation()}
            style={{
              width: '760px',
              maxWidth: '95vw',
              maxHeight: 'calc(100vh - 120px)',
              overflowY: 'auto',
              padding: '2.5rem',
              background: '#FFFFFF',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              margin: '0 auto'
            }}
          >
            
            {/* Contract Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  DAR-SOINS — ÉTABLISSEMENT DE SOINS À DOMICILE
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
                  CONTRAT DE SERVICE DE GARDE INFIRMIÈRE
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '2px 0 0' }}>
                  Réf: <strong>{selectedContrat.reference}</strong> | Statut: {renderStatusBadge(selectedContrat.statut)}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {/* General Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <User size={14} /> Le Patient / Client
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedContrat.client?.user ? `${selectedContrat.client.user.prenom || ''} ${selectedContrat.client.user.nom || ''}`.trim() : `Client #${selectedContrat.client_id}`}
                </p>
                {selectedContrat.client?.adresse && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Adresse: {selectedContrat.client.adresse}</p>}
                {selectedContrat.client?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Tél: {selectedContrat.client.telephone}</p>}
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Infirmier(ère) Affecté(e)
                </span>
                <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                  {selectedContrat.infirmier?.user ? `${selectedContrat.infirmier.user.prenom || ''} ${selectedContrat.infirmier.user.nom || ''}`.trim() : 'En attente d\'attribution'}
                </p>
                {selectedContrat.infirmier?.telephone && <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#475569' }}>Tél: {selectedContrat.infirmier.telephone}</p>}
              </div>
            </div>

            {/* Garde Specifics */}
            <div style={{ marginBottom: '1.5rem', background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e3a8a' }}>Spécificités de la Garde :</span>
                {renderTypeGardeBadge(selectedContrat.type_garde)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <strong style={{ color: '#1e40af' }}>Date de Début:</strong>
                  <div>{selectedContrat.date_debut}</div>
                </div>
                <div>
                  <strong style={{ color: '#1e40af' }}>Date de Fin:</strong>
                  <div>{selectedContrat.date_fin}</div>
                </div>
                <div>
                  <strong style={{ color: '#1e40af' }}>Horaires de Garde:</strong>
                  <div>{selectedContrat.horaires_garde || 'Selon planning d\'intervention'}</div>
                </div>
              </div>
            </div>

            {/* Prescriptions Medicales */}
            {selectedContrat.prescriptions_medicales && (
              <div style={{ marginBottom: '1.5rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '14px 18px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#991b1b', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HeartPulse size={16} /> Prescriptions Medicales & Protocole de Soins
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#7f1d1d', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {selectedContrat.prescriptions_medicales}
                </p>
              </div>
            )}

            {/* Clauses et Engagements */}
            {selectedContrat.clauses_specifiques && (
              <div style={{ marginBottom: '1.5rem', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px 18px', borderRadius: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>
                  Clauses Spécifiques & Engagement de Garde
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {selectedContrat.clauses_specifiques}
                </p>
              </div>
            )}

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', padding: '16px 20px', borderRadius: '12px', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Tarif Journalier de Garde:</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                  {Number(selectedContrat.tarif_journalier).toFixed(2)} MAD / jour
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MONTANT TOTAL DU CONTRAT:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#16a34a' }}>
                  {Number(selectedContrat.montant_total).toFixed(2)} MAD
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.2rem' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Statut:</span>
                <button onClick={() => handleUpdateStatus(selectedContrat.id, 'actif')} style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Actif</button>
                <button onClick={() => handleUpdateStatus(selectedContrat.id, 'termine')} style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Terminé</button>
                <button onClick={() => handleUpdateStatus(selectedContrat.id, 'resilie')} style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Résilié</button>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => window.print()} className="erp-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Printer size={16} /> Imprimer Contrat
                </button>
                <button onClick={() => setIsModalOpen(false)} className="erp-btn-primary">
                  Fermer
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
