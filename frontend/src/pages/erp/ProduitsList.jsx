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
      setData(response.data.data || response.data || []);
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
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Liste des Produits / Services</h1>
          <p className="text-muted text-sm mt-1">Gérez le catalogue des soins et services proposés.</p>
        </div>
        <button onClick={() => navigate('/gestionnaire/produits/create')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Ajouter Produit
        </button>
      </header>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.5rem 1rem', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
        <input 
          type="text" 
          placeholder="Rechercher par nom..." 
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'white', width: '100%', outline: 'none' }}
        />
      </div>

      {loading ? (
        <div className="text-center p-8 text-muted">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nom</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Prix Client (MAD)</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Rémunération (MAD)</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Package size={16} color="var(--primary-color)" />
                        {item.nom}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: item.type === 'soin' ? 'rgba(56, 189, 248, 0.1)' : (item.type === 'garde' ? 'rgba(167, 139, 250, 0.1)' : 'rgba(234, 179, 8, 0.1)'), 
                        color: item.type === 'soin' ? '#38bdf8' : (item.type === 'garde' ? '#a855f7' : '#eab308'), 
                        padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize' 
                      }}>
                        {item.type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '600', color: '#4ade80' }}>
                      {item.prix_client} MAD
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {item.remuneration_soignant ? `${item.remuneration_soignant} MAD` : '-'}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => alert("Edition de la page complète non gérée, veuillez supprimer et recréer.")} style={{ color: 'var(--primary-color)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Edit size={18} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}>
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
  );
}
