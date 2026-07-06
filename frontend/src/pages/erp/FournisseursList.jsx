import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, Download, Printer, Filter, X } from 'lucide-react';

export default function FournisseursList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', adresse: '', entreprise: '',
    code_fournisseur: '', pays: '', ville: '', code_postal: '', numero_taxe: ''
  });
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/fournisseurs');
      setData(response.data?.data || response.data?.data || response.data || []);
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
      nom: '', email: '', telephone: '', adresse: '', entreprise: '',
      code_fournisseur: '', pays: '', ville: '', code_postal: '', numero_taxe: ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (fournisseur) => {
    setFormData({
      nom: fournisseur.nom || '', email: fournisseur.email || '', telephone: fournisseur.telephone || '', 
      adresse: fournisseur.adresse || '', entreprise: fournisseur.entreprise || '',
      code_fournisseur: fournisseur.code_fournisseur || '', pays: fournisseur.pays || '', 
      ville: fournisseur.ville || '', code_postal: fournisseur.code_postal || '', 
      numero_taxe: fournisseur.numero_taxe || ''
    });
    setEditId(fournisseur.id);
    setShowModal(true);
  };

  const saveFournisseur = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editId) {
        await api.put(`/fournisseurs/${editId}`, formData);
      } else {
        await api.post('/fournisseurs', formData);
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

  const deleteFournisseur = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce fournisseur ?')) {
      try {
        await api.delete(`/fournisseurs/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.nom?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (item.entreprise?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.code_fournisseur?.toLowerCase() || '').includes(search.toLowerCase())
  );

  return (
    <div className="erp-page">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Fournisseurs</h1>
          <p className="erp-page-subtitle">Gérez vos fournisseurs et vos réapprovisionnements.</p>
        </div>
        <div className="erp-page-actions">
          <button className="erp-btn-secondary"><Printer size={16}/> Imprimer</button>
          <button className="erp-btn-secondary"><Download size={16}/> Exporter CSV</button>
          <button className="erp-btn-primary" onClick={openAddModal}>
            <Plus size={16}/> Ajouter un Fournisseur
          </button>
        </div>
      </header>

      <div className="erp-card">
        <div className="erp-toolbar">
          <div className="erp-search-box">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher par nom, entreprise ou code..." 
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
                <th>Fournisseur / Entreprise</th>
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
                <tr><td colSpan="6" className="text-center py-8 text-muted">Aucun fournisseur trouvé.</td></tr>
              ) : (
                filteredData.map((f) => (
                  <tr key={f.id}>
                    <td className="font-medium text-emerald-400">{f.code_fournisseur || '-'}</td>
                    <td>
                      <div className="font-semibold">{f.entreprise || f.nom}</div>
                      <div className="text-xs text-gray-400">{f.entreprise ? f.nom : ''}</div>
                    </td>
                    <td>
                      <div>{f.telephone || '-'}</div>
                      <div className="text-xs text-gray-400">{f.email || '-'}</div>
                    </td>
                    <td>{f.ville ? `${f.ville}, ${f.pays}` : '-'}</td>
                    <td>{f.numero_taxe || '-'}</td>
                    <td className="erp-table-actions">
                      <button onClick={() => openEditModal(f)} className="erp-action-btn edit" title="Modifier"><Edit2 size={16} /></button>
                      <button onClick={() => deleteFournisseur(f.id)} className="erp-action-btn delete" title="Supprimer"><Trash2 size={16} /></button>
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
              <h2>{editId ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={saveFournisseur} className="erp-modal-body">
              
              <div className="erp-form-grid">
                <div className="erp-form-group">
                  <label>Nom du Contact *</label>
                  <input type="text" name="nom" required value={formData.nom} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Nom de l'Entreprise</label>
                  <input type="text" name="entreprise" value={formData.entreprise} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Code Fournisseur</label>
                  <input type="text" name="code_fournisseur" placeholder="Laisser vide pour auto-générer" value={formData.code_fournisseur} onChange={handleInputChange} />
                </div>
                <div className="erp-form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
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
                  <label>Adresse Complète</label>
                  <input type="text" name="adresse" value={formData.adresse} onChange={handleInputChange} />
                </div>
              </div>

              <div className="erp-modal-footer mt-6">
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
