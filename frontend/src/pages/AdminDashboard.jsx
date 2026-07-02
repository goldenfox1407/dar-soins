import React, { useState, useEffect, useRef } from 'react';
import { Plus, Package, Users, Receipt, Pencil, Trash2, ImagePlus, X, Check, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const BACKEND_URL = 'http://localhost:8000/storage/';

const emptyForm = {
  nom: '', description: '', code_barres: '', type: 'soin',
  prix_client: '', remuneration_soignant: '', type_remise: 'none', valeur_remise: '0'
};

export default function AdminDashboard() {
  const navigate = useNavigate();
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
  }, []);

  const fetchProduits = async () => {
    try { const r = await api.get('/produits'); setProduits(r.data); } catch (e) { console.error(e); }
  };
  const fetchPersonnel = async () => {
    try { const r = await api.get('/personnel'); setPersonnel(r.data); } catch (e) { console.error(e); }
  };
  const fetchFactures = async () => {
    try { const r = await api.get('/factures'); setFactures(r.data); } catch (e) { console.error(e); }
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

  return (
    <div className="animate-fade-in">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setShowForm(false); }} className="btn-primary"
            style={{ width: 'auto', background: activeTab === t.id ? 'var(--primary-color)' : 'transparent', border: `1px solid ${activeTab === t.id ? 'var(--primary-color)' : 'var(--glass-border)'}`, display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '10px 20px' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ===================== TAB PRODUITS ===================== */}
      {activeTab === 'produits' && (
        <>
          {/* Formulaire Ajouter / Modifier */}
          {showForm && (
            <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {editingId ? <Pencil color="var(--primary-color)" size={22} /> : <Plus color="var(--primary-color)" size={22} />}
                {editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: '2rem' }}>

                {/* Colonne gauche */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nom du Produit *</label>
                    <input name="nom" value={formData.nom} onChange={handleInputChange} className="glass-input" placeholder="Ex: Injection sous-cutanée..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="glass-input" placeholder="Description affichée sur le site public..."></textarea>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Code-barres / SKU</label>
                      <input name="code_barres" value={formData.code_barres} onChange={handleInputChange} className="glass-input" placeholder="SKU-001..." />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type de Produit *</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="glass-input">
                        <option style={{ color: 'black' }} value="soin">Soin (Payé à l'acte)</option>
                        <option style={{ color: 'black' }} value="garde">Garde (Salarié)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--glass-border)' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--secondary-color)' }}>Tarification & Remises</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Prix Client (MAD) *</label>
                        <input type="number" name="prix_client" value={formData.prix_client} onChange={handleInputChange} className="glass-input" placeholder="0.00" />
                      </div>
                      {formData.type === 'soin' && (
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rémunération Infirmier</label>
                          <input type="number" name="remuneration_soignant" value={formData.remuneration_soignant} onChange={handleInputChange} className="glass-input" placeholder="0.00" />
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type de Remise</label>
                        <select name="type_remise" value={formData.type_remise} onChange={handleInputChange} className="glass-input">
                          <option style={{ color: 'black' }} value="none">Aucune</option>
                          <option style={{ color: 'black' }} value="percent">Pourcentage (%)</option>
                          <option style={{ color: 'black' }} value="fixed">Montant Fixe (MAD)</option>
                        </select>
                      </div>
                      {formData.type_remise !== 'none' && (
                        <div>
                          <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                            Valeur ({formData.type_remise === 'percent' ? '%' : 'MAD'})
                          </label>
                          <input type="number" name="valeur_remise" value={formData.valeur_remise} onChange={handleInputChange} className="glass-input" placeholder="0" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Colonne droite: Photo */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Photo du Produit</label>
                  <div
                    onClick={() => fileInputRef.current.click()}
                    style={{ width: '100%', height: '200px', borderRadius: '12px', border: '2px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-color)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <ImagePlus size={36} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>Cliquer pour uploader</span>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  {imagePreview && (
                    <button onClick={() => { setImagePreview(null); setImageFile(null); }} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                      Retirer l'image
                    </button>
                  )}
                </div>
              </div>

              <div style={{ marginTop: '2rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setShowForm(false)} style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <X size={16} /> Annuler
                </button>
                <button onClick={handleSave} className="btn-primary" style={{ width: 'auto', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={16} /> {editingId ? 'Enregistrer les modifications' : 'Créer le Produit'}
                </button>
              </div>
            </div>
          )}

          {/* Liste des Produits */}
          {!showForm && (
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                    <th style={{ padding: '1rem 1.2rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photo</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Produit</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix Client</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rémunération</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Remise</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {produits.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
                    >
                      {/* Photo */}
                      <td style={{ padding: '0.8rem 1.2rem' }}>
                        {p.image ? (
                          <img src={BACKEND_URL + p.image} alt={p.nom} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--glass-border)' }} />
                        ) : (
                          <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--glass-border)' }}>
                            <Package size={22} color="var(--text-muted)" />
                          </div>
                        )}
                      </td>
                      {/* Nom + desc */}
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.2rem' }}>{p.nom}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || '—'}</div>
                      </td>
                      {/* Type */}
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <span style={{ background: p.type === 'soin' ? 'rgba(14,165,233,0.15)' : 'rgba(16,185,129,0.15)', color: p.type === 'soin' ? 'var(--primary-color)' : 'var(--secondary-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600' }}>
                          {p.type === 'soin' ? 'Soin' : 'Garde'}
                        </span>
                      </td>
                      {/* Prix */}
                      <td style={{ padding: '0.8rem 1rem', fontWeight: 'bold', fontSize: '1.05rem' }}>{Number(p.prix_client).toFixed(2)} MAD</td>
                      {/* Rémunération */}
                      <td style={{ padding: '0.8rem 1rem', color: 'var(--text-muted)' }}>
                        {p.type === 'soin' ? `${Number(p.remuneration_soignant || 0).toFixed(2)} MAD` : <span style={{ fontSize: '0.8rem' }}>Salarié</span>}
                      </td>
                      {/* Remise */}
                      <td style={{ padding: '0.8rem 1rem' }}>
                        {p.type_remise === 'none' ? <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Aucune</span>
                          : <span style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                            -{p.valeur_remise}{p.type_remise === 'percent' ? '%' : ' MAD'}
                          </span>}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '0.8rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEditForm(p)} style={{ background: 'rgba(14,165,233,0.15)', border: '1px solid rgba(14,165,233,0.3)', color: 'var(--primary-color)', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                            <Pencil size={14} /> Modifier
                          </button>
                          <button onClick={() => handleDelete(p.id, p.nom)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '7px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {produits.length === 0 && (
                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
                  <p>Aucun produit. Cliquez sur "Ajouter un Produit" pour commencer.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ===================== TAB PERSONNEL ===================== */}
      {activeTab === 'personnel' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Gestion des Infirmiers</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                {['Nom', 'Email', 'Disponibilité', 'Statut SaaS'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {personnel.map(inf => (
                <tr key={inf.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{inf.user?.nom}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{inf.user?.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: inf.est_disponible ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)', color: inf.est_disponible ? '#10b981' : '#f87171', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>
                      {inf.est_disponible ? '✓ Disponible' : '✗ Indisponible'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(14,165,233,0.15)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>Actif</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===================== TAB FINANCES ===================== */}
      {activeTab === 'finances' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--glass-border)' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>Historique des Factures</h2>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.03)' }}>
                {['Patient', 'Produit', 'Montant TTC', 'Date', 'Télécharger'].map(h => (
                  <th key={h} style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {factures.map(fac => (
                <tr key={fac.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '1rem', fontWeight: '600' }}>{fac.intervention?.client?.user?.nom || '—'}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{fac.intervention?.produit?.nom || '—'}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--secondary-color)', fontSize: '1.05rem' }}>{fac.montant_total} MAD</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{new Date(fac.date_emission).toLocaleDateString('fr-FR')}</td>
                  <td style={{ padding: '1rem' }}>
                    <a href={`http://localhost:8000/api/factures/${fac.id}/pdf`} target="_blank" rel="noreferrer"
                      style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--secondary-color)', padding: '7px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '0.85rem', display: 'inline-block' }}>
                      ↓ PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {factures.length === 0 && <p style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Aucune facture pour l'instant.</p>}
        </div>
      )}
    </div>
  );
}
