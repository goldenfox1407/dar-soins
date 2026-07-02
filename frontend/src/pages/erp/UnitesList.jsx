import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, X, Search, Tag } from 'lucide-react';
import api from '../../services/api';

export default function UnitesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ nom: '', nom_court: '', allow_decimal: false });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/unites');
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setFormData({ nom: item.nom, nom_court: item.nom_court || '', allow_decimal: item.allow_decimal || false });
    } else {
      setCurrentItem(null);
      setFormData({ nom: '', nom_court: '', allow_decimal: false });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentItem) await api.put(`/unites/${currentItem.id}`, formData);
      else await api.post('/unites', formData);
      setIsModalOpen(false);
      fetchData();
    } catch (error) { alert("Erreur lors de l'enregistrement."); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await api.delete(`/unites/${id}`);
        fetchData();
      } catch (error) { alert("Erreur lors de la suppression."); }
    }
  };

  const filteredData = Array.isArray(data) ? data.filter(item => 
    item.nom?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>Unités</h1>
          <p className="text-muted text-sm mt-1">Gérez les unités de mesure.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Ajouter
        </button>
      </header>

      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '0.5rem 1rem', width: '300px' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '10px' }} />
        <input 
          type="text" 
          placeholder="Rechercher..." 
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
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nom court</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Décimales Autorisées</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Aucune donnée.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={16} color="var(--primary-color)" /> {item.nom}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>{item.nom_court || '-'}</td>
                    <td style={{ padding: '1rem' }}>{item.allow_decimal ? 'Oui' : 'Non'}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button onClick={() => handleOpenModal(item)} style={{ color: 'var(--primary-color)', marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}><Edit size={18} /></button>
                      <button onClick={() => handleDelete(item.id)} style={{ color: '#f87171', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '400px', padding: '2rem', position: 'relative', margin: 'auto', marginTop: '10vh' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', color: 'white' }}>{currentItem ? 'Modifier' : 'Nouveau'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Nom (ex: Pièce)</label>
                <input type="text" className="glass-input" required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Nom court (ex: pc)</label>
                <input type="text" className="glass-input" value={formData.nom_court} onChange={e => setFormData({...formData, nom_court: e.target.value})} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
                <input type="checkbox" id="allow_decimal" checked={formData.allow_decimal} onChange={e => setFormData({...formData, allow_decimal: e.target.checked})} />
                <label htmlFor="allow_decimal" style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Autoriser les décimales</label>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Enregistrer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
