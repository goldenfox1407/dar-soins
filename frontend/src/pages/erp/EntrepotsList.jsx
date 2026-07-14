import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Search, Plus, Edit2, Trash2, X, Check, Building2, MapPin, Phone
} from 'lucide-react';

export default function EntrepotsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nom: '',
    localisation: '',
    telephone: '',
    est_principal: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entrepots');
      setData(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Erreur chargement entrepôts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({
      nom: '',
      localisation: '',
      telephone: '',
      est_principal: false
    });
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditId(item.id);
    setFormData({
      nom: item.nom || '',
      localisation: item.localisation || '',
      telephone: item.telephone || '',
      est_principal: !!item.est_principal
    });
    setShowModal(true);
  };

  const saveEntrepot = async (e) => {
    e.preventDefault();
    if (!formData.nom) return;
    setIsSaving(true);
    try {
      if (editId) {
        await api.put(`/entrepots/${editId}`, formData);
      } else {
        await api.post('/entrepots', formData);
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error('Erreur sauvegarde entrepôt:', error);
      alert('Une erreur est survenue.');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEntrepot = async (id, nom) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'entrepôt "${nom}" ?`)) {
      try {
        await api.delete(`/entrepots/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression entrepôt:', error);
        alert('Erreur lors de la suppression.');
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.localisation?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.telephone?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="erp-page animate-fade-in">
      
      {/* Header section */}
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title flex items-center gap-2">
            <Building2 className="text-blue-500" size={24} />
            <span>Entrepôts & Dépôts</span>
          </h1>
          <p className="erp-page-subtitle">Gérez les localisations physiques de stockage et de distribution des matériels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="erp-btn-primary"
        >
          <Plus size={18} />
          <span>Ajouter un entrepôt</span>
        </button>
      </header>

      {/* Main Container Card */}
      <div className="erp-card">
        
        {/* Search bar */}
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, ville, téléphone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Localisation</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">
                    Chargement des entrepôts...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16 text-muted">
                    <Building2 size={48} style={{ color: 'var(--text-muted)' }} className="mx-auto mb-4" />
                    <p>Aucun entrepôt disponible pour le moment.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td className="font-semibold">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-blue-500" />
                        <span>{item.nom}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-muted">
                        <MapPin size={14} />
                        <span>{item.localisation || '—'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 text-muted">
                        <Phone size={14} />
                        <span>{item.telephone || '—'}</span>
                      </div>
                    </td>
                    <td>
                      {item.est_principal ? (
                        <span className="status-badge success">Principal</span>
                      ) : (
                        <span className="status-badge neutral">Secondaire</span>
                      )}
                    </td>
                    <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => openEditModal(item)} 
                        className="erp-action-btn edit"
                        title="Modifier"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteEntrepot(item.id, item.nom)} 
                        className="erp-action-btn delete"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup Form */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="glass-panel" style={{ width: '420px', padding: '2rem', position: 'relative', margin: 'auto', background: '#FFFFFF', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-color)', margin: 0, fontWeight: 'bold' }}>{editId ? 'Modifier l\'Entrepôt' : 'Ajouter un Entrepôt'}</h2>
            
            <form onSubmit={saveEntrepot} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nom de l'entrepôt *</label>
                <input 
                  type="text"
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Dépôt Central..." 
                  required
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Adresse / Localisation</label>
                <input 
                  type="text"
                  name="localisation" 
                  value={formData.localisation} 
                  onChange={handleInputChange} 
                  placeholder="Ex: Quartier Agdal, Rabat..." 
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div className="erp-form-group">
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Téléphone</label>
                <input 
                  type="text"
                  name="telephone" 
                  value={formData.telephone} 
                  onChange={handleInputChange} 
                  placeholder="Ex: +212 522 XXXXXX..." 
                  style={{ padding: '8px 12px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox"
                  id="est_principal"
                  name="est_principal" 
                  checked={formData.est_principal} 
                  onChange={handleInputChange} 
                  style={{ cursor: 'pointer' }}
                />
                <label htmlFor="est_principal" style={{ fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
                  Définir comme entrepôt principal
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="erp-btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="erp-btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  {isSaving ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
