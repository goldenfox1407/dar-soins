import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, Download, Printer, Filter, X } from 'lucide-react';

export default function ClientsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', pays: '', ville: '', 
    code_postal: '', numero_taxe: '', limite_credit: '', notes_internes: ''
  });
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clients');
      setData(response.data || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({
      nom: '', email: '', telephone: '', pays: '', ville: '', 
      code_postal: '', numero_taxe: '', limite_credit: '', notes_internes: ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (client) => {
    setFormData({
      nom: client.nom || '', email: client.email || '', telephone: client.telephone || '', 
      pays: client.pays || '', ville: client.ville || '', code_postal: client.code_postal || '', 
      numero_taxe: client.numero_taxe || '', limite_credit: client.limite_credit || '', notes_internes: client.notes_internes || ''
    });
    setEditId(client.id);
    setShowModal(true);
  };

  const saveClient = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editId) {
        await api.put(`/clients/${editId}`, formData);
      } else {
        await api.post('/clients', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce client ?')) {
      try {
        await api.delete(`/clients/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.nom?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (item.code_client?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.telephone || '').includes(search)
  );

  return (
    <div className="erp-page">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Clients</h1>
          <p className="erp-page-subtitle">Gérez vos clients et leurs informations de facturation.</p>
        </div>
        <div className="erp-page-actions">
          <button className="erp-btn-secondary"><Printer size={16}/> Imprimer</button>
          <button className="erp-btn-secondary"><Download size={16}/> Exporter CSV</button>
          <button className="erp-btn-primary" onClick={openAddModal}>
            <Plus size={16}/> Ajouter un Client
          </button>
        </div>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, code ou téléphone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className="erp-btn-secondary"><Filter size={16}/> Filtres</button>
        </div>

        <div className="erp-table-container">
          <table className="erp-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nom</th>
                <th>Contact</th>
                <th>Localisation</th>
                <th>N° Taxe</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Chargement...</td></tr>
              ) : filteredData.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted">Aucun client trouvé.</td></tr>
              ) : (
                filteredData.map((client) => (
                  <tr key={client.id}>
                    <td className="font-medium text-blue-400">{client.code_client}</td>
                    <td className="font-semibold">{client.nom}</td>
                    <td>
                      <div>{client.telephone || '-'}</div>
                      <div className="text-xs text-gray-400">{client.email || '-'}</div>
                    </td>
                    <td>
                      <div className="text-sm">
                        {client.adresse ? client.adresse : 
                         (client.ville ? `${client.ville}, ${client.pays}` : '-')}
                      </div>
                      {client.latitude && (
                        <a 
                          href={`https://www.google.com/maps?q=${client.latitude},${client.longitude}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 mt-1 font-medium"
                        >
                          📌 Voir sur la carte
                        </a>
                      )}
                    </td>
                    <td>{client.numero_taxe || '-'}</td>
                    <td className="erp-table-actions">
                      <button onClick={() => openEditModal(client)} className="erp-action-btn edit" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => deleteClient(client.id)} className="erp-action-btn delete" title="Supprimer"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT/MODIFICATION */}
      {showModal && (
        <div className="erp-modal-overlay">
          <div className="erp-modal">
            <div className="erp-modal-header">
              <h2>{editId ? 'Modifier Client' : 'Nouveau Client'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={saveClient} className="erp-modal-body">
              
              <div className="erp-form-grid">
                <div className="erp-form-group">
                  <label>Nom Complet *</label>
                  <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Téléphone</label>
                  <input type="text" name="telephone" value={formData.telephone} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Numéro de Taxe / RC</label>
                  <input type="text" name="numero_taxe" value={formData.numero_taxe} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Pays</label>
                  <input type="text" name="pays" value={formData.pays} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Ville</label>
                  <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Code Postal</label>
                  <input type="text" name="code_postal" value={formData.code_postal} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Limite de Crédit</label>
                  <input type="number" step="0.01" name="limite_credit" value={formData.limite_credit} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="erp-form-group full-width mt-4">
                <label>Notes Internes</label>
                <textarea name="notes_internes" rows="3" value={formData.notes_internes} onChange={handleInputChange}></textarea>
              </div>

              <div className="erp-modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="erp-btn-secondary">Annuler</button>
                <button type="submit" disabled={isSaving} className="erp-btn-primary">
                  {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
