import React, { useState, useEffect, useRef } from 'react';
import { Plus, Package, Users, Receipt, Pencil, Trash2, ImagePlus, X, Check, LogOut, Coins, ShieldAlert, Award, FileText } from 'lucide-react';
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

  // Calculations for stats cards
  const totalRevenue = factures.reduce((sum, item) => sum + Number(item.montant_total || 0), 0);
  const availableNurses = personnel.filter(p => p.est_disponible).length;

  return (
    <div className="animate-fade-in text-slate-200">
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Revenue */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Chiffre d'Affaires</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/25">
              <Coins className="text-emerald-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{totalRevenue.toLocaleString('fr-FR')} MAD</p>
          <p className="text-xs text-slate-500 mt-2">Cumulé sur toutes les factures</p>
        </div>

        {/* Card 2: Staff */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Personnel Infirmier</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/25">
              <Users className="text-blue-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{personnel.length}</p>
          <p className="text-xs text-slate-500 mt-2">{availableNurses} disponibles actuellement</p>
        </div>

        {/* Card 3: Products */}
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-slate-400">Produits & Soins</span>
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/25">
              <Package className="text-violet-400" size={20} />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">{produits.length}</p>
          <p className="text-xs text-slate-500 mt-2">Soins & gardes configurés</p>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex gap-2 mb-8 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
        {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => { setActiveTab(t.id); setShowForm(false); }} 
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all border-none cursor-pointer ${
              activeTab === t.id 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white bg-transparent'
            }`}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <Package size={22} className="text-blue-500" />
                <span>Catalogue des soins</span>
              </h2>
              <button 
                onClick={openAddForm}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
              >
                <Plus size={18} />
                <span>Ajouter un produit</span>
              </button>
            </div>
          )}

          {/* Formulaire Ajouter / Modifier */}
          {showForm && (
            <div className="bg-slate-850/60 border border-slate-700/40 rounded-2xl p-6 lg:p-8 mb-8 animate-scale-in shadow-xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white border-b border-slate-800 pb-4">
                {editingId ? <Pencil className="text-blue-500" size={22} /> : <Plus className="text-emerald-500" size={22} />}
                <span>{editingId ? 'Modifier le Produit' : 'Ajouter un Produit'}</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-8">
                
                {/* Column left/middle (Form inputs) */}
                <div className="md:col-span-2 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400">Nom du Produit *</label>
                      <input 
                        name="nom" 
                        value={formData.nom} 
                        onChange={handleInputChange} 
                        className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                        placeholder="Ex: Injection sous-cutanée..." 
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400">Code-barres / SKU</label>
                      <input 
                        name="code_barres" 
                        value={formData.code_barres} 
                        onChange={handleInputChange} 
                        className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                        placeholder="SKU-001..." 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows="3" 
                      className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all resize-none" 
                      placeholder="Description affichée sur le site public..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400">Type de Produit *</label>
                      <select 
                        name="type" 
                        value={formData.type} 
                        onChange={handleInputChange} 
                        className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                      >
                        <option value="soin">Soin (Payé à l'acte)</option>
                        <option value="garde">Garde (Salarié)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400">Prix Client (MAD) *</label>
                      <input 
                        type="number" 
                        name="prix_client" 
                        value={formData.prix_client} 
                        onChange={handleInputChange} 
                        className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                        placeholder="0.00" 
                        required
                      />
                    </div>
                  </div>

                  <div className="p-5 bg-slate-900/30 border border-slate-800 rounded-xl space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300">Rémunération & Remises</h3>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      {formData.type === 'soin' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400">Rémunération Infirmier (MAD)</label>
                          <input 
                            type="number" 
                            name="remuneration_soignant" 
                            value={formData.remuneration_soignant} 
                            onChange={handleInputChange} 
                            className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                            placeholder="0.00" 
                          />
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400">Type de Remise</label>
                        <select 
                          name="type_remise" 
                          value={formData.type_remise} 
                          onChange={handleInputChange} 
                          className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                        >
                          <option value="none">Aucune</option>
                          <option value="percent">Pourcentage (%)</option>
                          <option value="fixed">Montant Fixe (MAD)</option>
                        </select>
                      </div>

                      {formData.type_remise !== 'none' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400">
                            Valeur ({formData.type_remise === 'percent' ? '%' : 'MAD'})
                          </label>
                          <input 
                            type="number" 
                            name="valeur_remise" 
                            value={formData.valeur_remise} 
                            onChange={handleInputChange} 
                            className="bg-slate-900/40 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all" 
                            placeholder="0" 
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Column right (Product Image) */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-semibold text-slate-400">Photo du Produit</label>
                  <div
                    onClick={() => fileInputRef.current.click()}
                    className="w-full h-56 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-slate-900/50 hover:bg-slate-900/80 transition-all shadow-inner"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImagePlus size={36} className="text-slate-500 mb-2" />
                        <span className="text-slate-500 text-xs text-center px-4">Cliquer pour uploader une image</span>
                      </>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {imagePreview && (
                    <button 
                      onClick={() => { setImagePreview(null); setImageFile(null); }} 
                      className="w-full bg-slate-900/60 border border-slate-700 text-slate-400 hover:text-white py-2 rounded-xl cursor-pointer text-xs transition-colors"
                    >
                      Retirer l'image
                    </button>
                  )}
                </div>
              </div>

              {/* Actions footer */}
              <div className="mt-8 border-t border-slate-800 pt-6 flex justify-end gap-3">
                <button 
                  onClick={() => setShowForm(false)} 
                  className="flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 px-5 py-2.5 rounded-xl font-semibold transition-all cursor-pointer"
                >
                  <X size={16} /> <span>Annuler</span>
                </button>
                <button 
                  onClick={handleSave} 
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Check size={16} /> <span>{editingId ? 'Enregistrer les modifications' : 'Créer le Produit'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Liste des Produits */}
          {!showForm && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-700/60 bg-slate-900/30">
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-6">Photo</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Produit</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Prix Client</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Rémunération</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Remise</th>
                      <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {produits.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-750/30 transition-colors">
                        {/* Photo */}
                        <td className="p-4 pl-6">
                          {p.image ? (
                            <img src={BACKEND_URL + p.image} alt={p.nom} className="w-12 h-12 rounded-xl object-cover border border-slate-700" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                              <Package size={20} className="text-slate-600" />
                            </div>
                          )}
                        </td>
                        {/* Nom + desc */}
                        <td className="p-4">
                          <div className="font-bold text-white mb-0.5">{p.nom}</div>
                          <div className="text-xs text-slate-500 max-w-xs truncate">{p.description || '—'}</div>
                        </td>
                        {/* Type */}
                        <td className="p-4">
                          <span className={`status-badge-dark ${p.type === 'soin' ? 'info' : 'success'}`}>
                            {p.type === 'soin' ? 'Soin' : 'Garde'}
                          </span>
                        </td>
                        {/* Prix */}
                        <td className="p-4 font-bold text-white">{Number(p.prix_client).toFixed(2)} MAD</td>
                        {/* Rémunération */}
                        <td className="p-4 text-slate-300">
                          {p.type === 'soin' ? `${Number(p.remuneration_soignant || 0).toFixed(2)} MAD` : <span className="text-xs text-slate-500">Salarié</span>}
                        </td>
                        {/* Remise */}
                        <td className="p-4">
                          {p.type_remise === 'none' ? <span className="text-xs text-slate-500">Aucune</span>
                            : <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                              -{p.valeur_remise}{p.type_remise === 'percent' ? '%' : ' MAD'}
                            </span>}
                        </td>
                        {/* Actions */}
                        <td className="p-4 pr-6">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditForm(p)} 
                              className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg cursor-pointer transition-colors"
                              title="Modifier"
                            >
                              <Pencil size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id, p.nom)} 
                              className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-2 rounded-lg cursor-pointer transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {produits.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  <Package size={48} className="mx-auto mb-4 text-slate-600" />
                  <p>Aucun produit disponible. Cliquez sur "Ajouter un produit" pour commencer.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB PERSONNEL ===================== */}
      {activeTab === 'personnel' && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md animate-fade-in">
          <div className="p-6 border-b border-slate-700/60 bg-slate-900/30">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Users size={22} className="text-blue-500" />
              <span>Gestion des Infirmiers</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/30">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-6">Nom</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Disponibilité</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Statut SaaS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {personnel.map((inf) => (
                  <tr key={inf.id} className="hover:bg-slate-750/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">{inf.user?.nom}</td>
                    <td className="p-4 text-slate-300">{inf.user?.email}</td>
                    <td className="p-4">
                      <span className={`status-badge-dark ${inf.est_disponible ? 'success' : 'danger'}`}>
                        {inf.est_disponible ? '✓ Disponible' : '✗ Indisponible'}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <span className="status-badge-dark info">Actif</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {personnel.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <Users size={48} className="mx-auto mb-4 text-slate-600" />
              <p>Aucun infirmier disponible dans le personnel.</p>
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB FINANCES ===================== */}
      {activeTab === 'finances' && (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md animate-fade-in">
          <div className="p-6 border-b border-slate-700/60 bg-slate-900/30">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Receipt size={22} className="text-blue-500" />
              <span>Historique des Factures</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-700/60 bg-slate-900/30">
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-6">Patient</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Produit</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Montant TTC</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Télécharger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {factures.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-750/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">{fac.intervention?.client?.user?.nom || '—'}</td>
                    <td className="p-4 text-slate-300">{fac.intervention?.produit?.nom || '—'}</td>
                    <td className="p-4 font-bold text-emerald-400">{fac.montant_total} MAD</td>
                    <td className="p-4 text-slate-400">{new Date(fac.date_emission).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 pr-6">
                      <a 
                        href={`http://localhost:8000/api/factures/${fac.id}/pdf`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors inline-block no-underline"
                      >
                        ↓ PDF
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {factures.length === 0 && (
            <div className="py-16 text-center text-slate-500">
              <Receipt size={48} className="mx-auto mb-4 text-slate-600" />
              <p>Aucune facture enregistrée pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
