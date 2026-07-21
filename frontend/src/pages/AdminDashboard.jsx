import React, { useState, useEffect, useRef } from 'react';
import { Plus, Package, Users, Receipt, Pencil, Trash2, ImagePlus, X, Check, Coins } from 'lucide-react';
import api from '../services/api';

const BACKEND_URL = 'http://127.0.0.1:8000/storage/';

const emptyForm = {
  nom: '', description: '', code_barres: '', type: 'soin',
  prix_client: '', remuneration_soignant: '', type_remise: 'none', valeur_remise: '0'
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('produits');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [produits, setProduits] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [factures, setFactures] = useState([]);

  const fileInputRef = useRef();

  useEffect(() => {
    fetchProduits();
    fetchPersonnel();
    fetchFactures();

    const interval = setInterval(() => {
      fetchProduits();
      fetchPersonnel();
      fetchFactures();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchProduits = async () => {
    try { const r = await api.get('/produits'); setProduits(r.data.data ? r.data.data : r.data); } catch (e) { console.error(e); }
  };
  const fetchPersonnel = async () => {
    try { const r = await api.get('/personnel'); setPersonnel(r.data.data ? r.data.data : r.data); } catch (e) { console.error(e); }
  };
  const fetchFactures = async () => {
    try { const r = await api.get('/factures'); setFactures(r.data.data ? r.data.data : r.data); } catch (e) { console.error(e); }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setImagePreview(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEditForm = (produit) => {
    setEditingId(produit.id);
    setFormData({
      nom: produit.nom || '', description: produit.description || '',
      code_barres: produit.code_barres || '', type: produit.type,
      prix_client: produit.prix_client, remuneration_soignant: produit.remuneration_soignant || '',
      type_remise: produit.type_remise, valeur_remise: produit.valeur_remise
    });
    setImagePreview(produit.image ? BACKEND_URL + produit.image : null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        fd.append('_method', 'PUT');
        await api.post(`/produits/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/produits', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowForm(false);
      fetchProduits();
    } catch (e) {
      alert("Erreur lors de l'enregistrement.");
      console.error(e?.response?.data || e);
    }
  };

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer "${nom}" définitivement ?`)) return;
    try {
      await api.delete(`/produits/${id}`);
      fetchProduits();
    } catch (e) {
      alert("Erreur suppression.");
    }
  };

  const tabs = [
    { id: 'produits', label: 'Catalogue Produits', icon: <Package size={18} /> },
    { id: 'personnel', label: 'Personnel RH', icon: <Users size={18} /> },
    { id: 'finances', label: 'Devis & Factures', icon: <Receipt size={18} /> },
  ];

  // Calculations for stats cards
  const totalRevenue = factures.reduce((sum, item) => sum + Number(item.montant_total || 0), 0);
  const availableNurses = personnel.filter(p => p.est_disponible).length;

  return (
    <div className="erp-page animate-fade-in">
      
      {/* Stat Cards */}
      <div className="erp-form-grid mb-6" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
        {/* Card 1: Revenue */}
        <div className="stat-card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Chiffre d'Affaires</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins className="text-emerald-500" size={20} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{totalRevenue.toLocaleString('fr-FR')} MAD</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Cumulé sur toutes les factures</p>
        </div>

        {/* Card 2: Staff */}
        <div className="stat-card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Personnel Infirmier</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users className="text-blue-500" size={20} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{personnel.length}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '5px 0 0 0' }}>{availableNurses} disponibles actuellement</p>
        </div>

        {/* Card 3: Products */}
        <div className="stat-card" style={{ background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Produits & Soins</span>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package className="text-purple-500" size={20} />
            </div>
          </div>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{produits.length}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '5px 0 0 0' }}>Soins & gardes configurés</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="erp-card p-1.5" style={{ display: 'flex', gap: '8px', marginBottom: '24px', background: '#F1F5F9', border: '1px solid var(--card-border)' }}>
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => { setActiveTab(t.id); setShowForm(false); }} 
            className={activeTab === t.id ? 'erp-btn-primary' : 'erp-btn-secondary'}
            style={{ flex: 1, border: 'none', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '10px' }}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ===================== TAB PRODUITS ===================== */}
      {activeTab === 'produits' && (
        <div className="animate-fade-in">
          {/* Header Actions */}
          {!showForm && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-main)', margin: 0 }}>
                <Package size={22} className="text-blue-500" />
                <span>Catalogue des soins</span>
              </h2>
              <button 
                onClick={openAddForm}
                className="erp-btn-primary"
              >
                <Plus size={18} />
                <span>Ajouter un produit</span>
              </button>
            </div>
          )}

          {/* Formulaire Ajouter / Modifier */}
          {showForm && (
            <div className="erp-card p-6 mb-6">
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--primary-color)', margin: '0 0 20px 0', paddingBottom: '12px', borderBottom: '1px solid var(--card-border)' }}>
                {editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h2>

              <div className="erp-form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                
                {/* Column inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="erp-form-group">
                      <label>Nom du Produit *</label>
                      <input 
                        name="nom" 
                        value={formData.nom} 
                        onChange={handleInputChange} 
                        placeholder="Ex: Injection sous-cutanée..." 
                        required
                      />
                    </div>
                    <div className="erp-form-group">
                      <label>Code-barres / SKU</label>
                      <input 
                        name="code_barres" 
                        value={formData.code_barres} 
                        onChange={handleInputChange} 
                        placeholder="SKU-001..." 
                      />
                    </div>
                  </div>

                  <div className="erp-form-group">
                    <label>Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows="3" 
                      placeholder="Description affichée sur le site public..."
                    />
                  </div>

                  <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="erp-form-group">
                      <label>Type de Produit *</label>
                      <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleInputChange} 
                      >
                        <option value="soin">Soin (Payé à l'acte)</option>
                        <option value="garde">Garde (Salarié)</option>
                      </select>
                    </div>

                    <div className="erp-form-group">
                      <label>Prix Client (MAD) *</label>
                      <input 
                        type="number" 
                        name="prix_client" 
                        value={formData.prix_client} 
                        onChange={handleInputChange} 
                        placeholder="0.00" 
                        required
                      />
                    </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '16px', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>Rémunération & Remises</h3>
                    
                    <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      {formData.type === 'soin' && (
                        <div className="erp-form-group">
                          <label>Rémunération Infirmier (MAD)</label>
                          <input 
                            type="number" 
                            name="remuneration_soignant" 
                            value={formData.remuneration_soignant} 
                            onChange={handleInputChange} 
                            placeholder="0.00" 
                          />
                        </div>
                      )}

                      <div className="erp-form-group">
                        <label>Type de Remise</label>
                        <select 
                          name="type_remise" 
                          value={formData.type_remise} 
                          onChange={handleInputChange} 
                        >
                          <option value="none">Aucune</option>
                          <option value="percent">Pourcentage (%)</option>
                          <option value="fixed">Montant Fixe (MAD)</option>
                        </select>
                      </div>

                      {formData.type_remise !== 'none' && (
                        <div className="erp-form-group">
                          <label>
                            Valeur ({formData.type_remise === 'percent' ? '%' : 'MAD'})
                          </label>
                          <input 
                            type="number" 
                            name="valeur_remise" 
                            value={formData.valeur_remise} 
                            onChange={handleInputChange} 
                            placeholder="0" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column Photo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Photo du Produit</label>
                  <div
                    onClick={() => fileInputRef.current.click()}
                    style={{ width: '100%', height: '220px', borderRadius: '12px', border: '2px dashed var(--card-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: '#F8FAFC' }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <ImagePlus size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 16px' }}>Cliquer pour uploader une image</span>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  {imagePreview && (
                    <button 
                      onClick={() => { setImagePreview(null); setImageFile(null); }} 
                      className="erp-btn-secondary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Retirer l'image
                    </button>
                  )}
                </div>
              </div>

              {/* Actions footer */}
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--card-border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                  onClick={() => setShowForm(false)} 
                  className="erp-btn-secondary"
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSave} 
                  className="erp-btn-primary"
                >
                  <Check size={16} /> <span>{editingId ? 'Enregistrer les modifications' : 'Créer le Produit'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Liste des Produits */}
          {!showForm && (
            <div className="erp-table-container">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>Photo</th>
                    <th>Produit</th>
                    <th>Type</th>
                    <th>Prix Client</th>
                    <th>Rémunération</th>
                    <th>Remise</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((p) => (
                    <tr key={p.id}>
                      {/* Photo */}
                      <td>
                        {p.image ? (
                          <img src={BACKEND_URL + p.image} alt={p.nom} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--card-border)' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)' }}>
                            <Package size={20} className="text-muted" />
                          </div>
                        )}
                      </td>
                      {/* Nom + desc */}
                      <td>
                        <div className="font-semibold" style={{ color: 'var(--text-main)' }}>{p.nom}</div>
                        <div className="text-xs text-muted" style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</div>
                      </td>
                      {/* Type */}
                      <td>
                        <span className={`status-badge ${p.type === 'soin' ? 'info' : 'success'}`}>
                          {p.type === 'soin' ? 'Soin' : 'Garde'}
                        </span>
                      </td>
                      {/* Prix */}
                      <td className="font-semibold" style={{ color: 'var(--text-main)' }}>{Number(p.prix_client).toFixed(2)} MAD</td>
                      {/* Rémunération */}
                      <td className="text-muted">
                        {p.type === 'soin' ? `${Number(p.remuneration_soignant || 0).toFixed(2)} MAD` : <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Salarié</span>}
                      </td>
                      {/* Remise */}
                      <td>
                        {p.type_remise === 'none' ? <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Aucune</span>
                          : <span className="status-badge danger">
                            -{p.valeur_remise}{p.type_remise === 'percent' ? '%' : ' MAD'}
                          </span>}
                      </td>
                      {/* Actions */}
                      <td className="erp-table-actions" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => openEditForm(p)} 
                          className="erp-action-btn edit"
                          title="Modifier"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.nom)} 
                          className="erp-action-btn delete"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {produits.length === 0 && (
                <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={48} className="mx-auto mb-4" />
                  <p>Aucun produit disponible. Cliquez sur "Ajouter un produit" pour commencer.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB PERSONNEL ===================== */}
      {activeTab === 'personnel' && (
        <div className="erp-card animate-fade-in">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={22} className="text-blue-500" />
              <span>Gestion des Infirmiers</span>
            </h2>
          </div>
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Disponibilité</th>
                  <th className="text-right">Statut SaaS</th>
                </tr>
              </thead>
              <tbody>
                {personnel.map((inf) => (
                  <tr key={inf.id}>
                    <td className="font-semibold">{inf.user?.nom}</td>
                    <td className="text-muted">{inf.user?.email}</td>
                    <td>
                      <span className={`status-badge ${inf.est_disponible ? 'success' : 'danger'}`}>
                        {inf.est_disponible ? '✓ Disponible' : '✗ Indisponible'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="status-badge info">Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {personnel.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={48} className="mx-auto mb-4" />
                <p>Aucun infirmier disponible dans le personnel.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== TAB FINANCES ===================== */}
      {activeTab === 'finances' && (
        <div className="erp-card animate-fade-in">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Receipt size={22} className="text-blue-500" />
              <span>Historique des Factures</span>
            </h2>
          </div>
          <div className="erp-table-container">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Produit</th>
                  <th>Montant TTC</th>
                  <th>Date</th>
                  <th className="text-right">Télécharger</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((fac) => (
                  <tr key={fac.id}>
                    <td className="font-semibold">{fac.intervention?.client?.user?.nom || '—'}</td>
                    <td className="text-muted">{fac.intervention?.produit?.nom || '—'}</td>
                    <td className="font-bold text-emerald-500">{fac.montant_total} MAD</td>
                    <td className="text-muted">{new Date(fac.date_emission).toLocaleDateString('fr-FR')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <a 
                        href={`http://127.0.0.1:8000/api/factures/${fac.id}/pdf`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="erp-btn-secondary"
                        style={{ display: 'inline-flex', padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        ↓ PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {factures.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Receipt size={48} className="mx-auto mb-4" />
                <p>Aucune facture enregistrée pour le moment.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
