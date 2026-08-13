import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowRight, Eye, Trash2, X, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import api from '../../services/api';

export default function TransfertsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransfert, setSelectedTransfert] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/transferts');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching transferts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatut) => {
    try {
      await api.patch(`/transferts/${id}/statut`, { statut: newStatut });
      fetchData();
      if (selectedTransfert && selectedTransfert.id === id) {
        setSelectedTransfert({ ...selectedTransfert, statut: newStatut });
      }
    } catch (error) {
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce transfert de stock ?')) {
      try {
        await api.delete(`/transferts/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleShowDetails = (transfert) => {
    setSelectedTransfert(transfert);
    setIsModalOpen(true);
  };

  const renderStatusBadge = (statut) => {
    switch (statut) {
      case 'complete':
        return (
          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle size={14} /> Complété
          </span>
        );
      case 'en_attente':
        return (
          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={14} /> En Attente
          </span>
        );
      case 'annule':
        return (
          <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <XCircle size={14} /> Annulé
          </span>
        );
      default:
        return statut;
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item =>
    item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.entrepot_source?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.entrepot_destination?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Transferts de Stock</h1>
          <p className="erp-page-subtitle">Gérez les déplacements d'inventaire entre vos différents entrepôts.</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/transferts/ajouter')} className="erp-btn-primary">
          <Plus size={18} /> Créer un Transfert
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, entrepôt source/destination..." 
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
                  <th>Date</th>
                  <th>Entrepôt Source</th>
                  <th>Entrepôt Destination</th>
                  <th>Statut</th>
                  <th>Total Articles</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-muted">
                      Aucun transfert de stock trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="font-bold text-blue-600">
                        {item.reference}
                      </td>
                      <td>{item.date}</td>
                      <td>{item.entrepot_source ? item.entrepot_source.nom : 'Non spécifié'}</td>
                      <td>
                        <div className="flex items-center gap-1 font-semibold text-slate-700">
                          <ArrowRight size={14} className="text-blue-500" />
                          {item.entrepot_destination ? item.entrepot_destination.nom : 'Non spécifié'}
                        </div>
                      </td>
                      <td>{renderStatusBadge(item.statut)}</td>
                      <td>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {item.total_produits} produit{item.total_produits > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => handleShowDetails(item)} className="erp-action-btn view" title="Voir les détails">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="erp-action-btn delete" title="Supprimer">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {isModalOpen && selectedTransfert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '650px', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Transfert {selectedTransfert.reference}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  Date: {selectedTransfert.date} | Statut: {renderStatusBadge(selectedTransfert.statut)}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Entrepôt Source</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedTransfert.entrepot_source?.nom || 'Non spécifié'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Entrepôt Destination</span>
                <p style={{ margin: '4px 0 0', fontWeight: 600, color: '#1e293b' }}>{selectedTransfert.entrepot_destination?.nom || 'Non spécifié'}</p>
              </div>
            </div>

            {selectedTransfert.notes && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#475569' }}>
                <FileText size={16} style={{ display: 'inline', marginRight: '6px', color: '#2563eb' }} />
                <strong>Notes:</strong> {selectedTransfert.notes}
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Produits Transférés</h3>
            
            <table className="erp-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th className="text-right">Quantité Transférée</th>
                </tr>
              </thead>
              <tbody>
                {(selectedTransfert.lignes || []).map(line => (
                  <tr key={line.id}>
                    <td className="font-semibold">{line.produit?.nom || `Produit #${line.produit_id}`}</td>
                    <td className="text-right font-bold text-blue-600" style={{ fontSize: '1rem' }}>
                      {line.quantite} unités
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Change Status Buttons */}
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Modifier Statut:</span>
                <button 
                  onClick={() => handleUpdateStatus(selectedTransfert.id, 'complete')}
                  style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Complété
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedTransfert.id, 'en_attente')}
                  style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  En attente
                </button>
                <button 
                  onClick={() => handleUpdateStatus(selectedTransfert.id, 'annule')}
                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Annuler
                </button>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="erp-btn-secondary">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
