import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Search, Tag } from 'lucide-react';
import api from '../../services/api';

export default function MarquesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ nom: '', description: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/marques');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({ nom: item.nom, description: item.description || '' });
    } else {
      setCurrentItem(null);
      setFormData({ nom: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) await api.put(`/marques/${currentItem.id}`, formData);
      else await api.post('/marques', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) { alert("Erreur lors de l'enregistrement."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await api.delete(`/marques/${id}`);
        fetchData();
      } catch (error) { alert("Erreur lors de la suppression."); }
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item => 
    item.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Marques</h1>
          <p className="erp-page-subtitle">Gerez les marques de vos produits.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="erp-btn-primary">
          <Plus size={18} /> Ajouter
        </button>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher..." 
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
                  <th style={{ width: '80px' }}>ID</th>
                  <th>Nom</th>
                  <th>Description</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-muted">Aucune donnée.</td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id}>
                      <td className="text-muted">#{item.id}</td>
                      <td className="font-semibold">
                        <div className="flex items-center gap-2">
                          <Tag size={16} className="text-blue-500" /> {item.nom}
                        </div>
                      </td>
                      <td className="text-muted">{item.description || '-'}</td>
                      <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenModal(item)} className="erp-action-btn edit" title="Modifier"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(item.id)} className="erp-action-btn delete" title="Supprimer"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', position: 'relative', margin: 'auto', background: '#FFFFFF', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', margin: 0, fontWeight: 'bold' }}>{currentItem ? 'Modifier la marque' : 'Nouvelle marque'}</h2>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom de la marque *</label>
                <input type="text" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} style={{ padding: '8px 12px' }} />
              </div>
              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Description</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '8px 12px' }} />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="erp-btn-secondary" style={{ padding: '8px 16px' }}>Annuler</button>
                <button type="submit" className="erp-btn-primary" style={{ padding: '8px 20px' }}>Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
