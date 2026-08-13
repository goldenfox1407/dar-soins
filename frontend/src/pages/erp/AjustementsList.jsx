import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowRightLeft, Eye, Trash2, X, PlusCircle, MinusCircle, FileText } from 'lucide-react';
import api from '../../services/api';

export default function AjustementsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAjustement, setSelectedAjustement] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/ajustements');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching ajustements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet ajustement de stock ?')) {
      try {
        await api.delete(`/ajustements/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const handleShowDetails = (ajustement) => {
    setSelectedAjustement(ajustement);
    setIsModalOpen(true);
  };

  const filteredData = Array.isArray(data) ? data.filter(item =>
    item.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.entrepot?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Ajustements de Stock</h1>
          <p className="erp-page-subtitle">Gérez les réajustements quantitatifs de votre inventaire (+/-).</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/ajustements/ajouter')} className="erp-btn-primary">
          <Plus size={18} /> Créer un Ajustement
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par référence, entrepôt ou notes..." 
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
                  <th>Entrepôt</th>
                  <th>Total Articles</th>
                  <th>Auteur</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-muted">
                      Aucun ajustement de stock trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="font-bold text-blue-600">
                        <div className="flex items-center gap-2">
                          <ArrowRightLeft size={16} className="text-blue-500" />
                          {item.reference}
                        </div>
                      </td>
                      <td>{item.date}</td>
                      <td>{item.entrepot ? item.entrepot.nom : 'Tous les entrepôts'}</td>
                      <td>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                          {item.total_produits} produit{item.total_produits > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="text-muted">{item.user ? (item.user.name || item.user.nom) : 'Système'}</td>
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
      {isModalOpen && selectedAjustement && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel custom-scrollbar" style={{ width: '650px', maxHeight: '85vh', overflowY: 'auto', padding: '2rem', background: '#FFFFFF', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', pb: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                  Ajustement {selectedAjustement.reference}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0' }}>
                  Date: {selectedAjustement.date} | Entrepôt: {selectedAjustement.entrepot?.nom || 'Global'}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {selectedAjustement.notes && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 16px', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.88rem', color: '#475569' }}>
                <FileText size={16} style={{ display: 'inline', marginRight: '6px', color: '#2563eb' }} />
                <strong>Note:</strong> {selectedAjustement.notes}
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>Lignes d'Ajustement</h3>
            
            <table className="erp-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th className="text-center">Type</th>
                  <th className="text-right">Quantité</th>
                </tr>
              </thead>
              <tbody>
                {(selectedAjustement.lignes || []).map(line => (
                  <tr key={line.id}>
                    <td className="font-semibold">{line.produit?.nom || `Produit #${line.produit_id}`}</td>
                    <td className="text-center">
                      {line.type === 'add' ? (
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <PlusCircle size={14} /> Addition (+)
                        </span>
                      ) : (
                        <span style={{ background: '#fee2e2', color: '#991b1b', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MinusCircle size={14} /> Soustraction (-)
                        </span>
                      )}
                    </td>
                    <td className="text-right font-bold" style={{ fontSize: '1rem' }}>
                      {line.type === 'add' ? `+${line.quantite}` : `-${line.quantite}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
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
