import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Search, Package } from 'lucide-react';
import api from '../../services/api';

export default function ProduitsList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/produits');
      setData(response.data.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      try {
        await api.delete(`/produits/${id}`);
        fetchData();
      } catch (error) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item => 
    item.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Liste des Produits / Services</h1>
          <p className="erp-page-subtitle">Gérez le catalogue des soins et services proposés.</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/produits/create')} className="erp-btn-primary">
          <Plus size={18} /> Ajouter Produit
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom..." 
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
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Prix Client</th>
                  <th>Rémunération</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-muted">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-blue-500" />
                          {item.nom}
                        </div>
                      </td>
                      <td>
                        <span style={{ 
                          background: item.type === 'soin' ? 'rgba(37, 99, 235, 0.1)' : (item.type === 'garde' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(234, 179, 8, 0.1)'), 
                          color: item.type === 'soin' ? 'var(--primary-color)' : (item.type === 'garde' ? '#a855f7' : '#eab308'), 
                          padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' 
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td className="font-semibold text-emerald-500">
                        {item.prix_client} MAD
                      </td>
                      <td className="text-muted">
                        {item.remuneration_soignant ? `${item.remuneration_soignant} MAD` : '-'}
                      </td>
                      <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => alert("Edition de la page complète non gérée, veuillez supprimer et recréer.")} className="erp-action-btn edit" title="Modifier">
                          <Edit size={18} />
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
    </div>
  );
}
