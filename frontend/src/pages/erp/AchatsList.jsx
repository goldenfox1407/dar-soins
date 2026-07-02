import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, X, Check, ShoppingCart, Calendar, User, Building2, Coins, FileText } from 'lucide-react';

export default function AchatsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Dynamic options loaded from API
  const [fournisseurs, setFournisseurs] = useState([]);
  const [entrepots, setEntrepots] = useState([]);

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    reference: '', fournisseur_id: '', entrepot_id: '',
    statut: 'Commande', statut_paiement: 'Non paye',
    montant_total: '', notes: ''
  });
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
    loadOptions();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/achats');
      setData(response.data || []);
    } catch (error) {
      console.error('Erreur chargement achats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      const rF = await api.get('/fournisseurs');
      setFournisseurs(rF.data || []);
      const rE = await api.get('/entrepots');
      setEntrepots(rE.data || []);
    } catch (error) {
      console.error('Erreur chargement options fournisseurs/entrepôts:', error);
    }
  };

  const generateReference = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    return `ACH-${dateStr}-${randStr}`;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({
      reference: generateReference(),
      fournisseur_id: fournisseurs[0]?.id || '',
      entrepot_id: entrepots[0]?.id || '',
      statut: 'Commande',
      statut_paiement: 'Non paye',
      montant_total: '',
      notes: ''
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (achat) => {
    setFormData({
      reference: achat.reference || '',
      fournisseur_id: achat.fournisseur_id || '',
      entrepot_id: achat.entrepot_id || '',
      statut: achat.statut || 'Commande',
      statut_paiement: achat.statut_paiement || 'Non paye',
      montant_total: achat.montant_total || '',
      notes: achat.notes || ''
    });
    setEditId(achat.id);
    setShowModal(true);
  };

  const saveAchat = async (e) => {
    e.preventDefault();
    if (!formData.fournisseur_id || !formData.entrepot_id || !formData.montant_total) {
      alert("Veuillez remplir tous les champs obligatoires (*).");
      return;
    }
    setIsSaving(true);
    try {
      if (editId) {
        await api.put(`/achats/${editId}`, formData);
      } else {
        await api.post('/achats', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde achat:', error);
      alert("Erreur lors de l'enregistrement de l'achat.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAchat = async (id, ref) => {
    if (window.confirm(`Supprimer définitivement l'achat "${ref}" ?`)) {
      try {
        await api.delete(`/achats/${id}`);
        fetchData();
      } catch (error) {
        console.error('Erreur suppression achat:', error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.reference?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (item.fournisseur?.nom?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.entrepot?.nom?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const getStatusBadge = (statut) => {
    const normal = String(statut).toLowerCase();
    if (normal.includes('recu') || normal.includes('reçu')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Reçu</span>;
    }
    if (normal.includes('attente')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">En attente</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Commandé</span>;
  };

  const getPaymentBadge = (payStatus) => {
    const normal = String(payStatus).toLowerCase();
    if (normal.includes('paye') || normal.includes('payé')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Payé</span>;
    }
    if (normal.includes('partiel')) {
      return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">Partiel</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Non payé</span>;
  };

  return (
    <div className="animate-fade-in text-slate-200">
      
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <ShoppingCart className="text-blue-500" size={24} />
            <span>Gestion des Achats</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Créez et suivez les bons d'achats passés auprès de vos fournisseurs de matériel médical.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>Ajouter un achat</span>
        </button>
      </div>

      {/* Search Input bar */}
      <div className="mb-6 flex max-w-md items-center bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-inner">
        <Search size={18} className="text-slate-500 mr-2.5" />
        <input 
          type="text" 
          placeholder="Rechercher par référence, fournisseur, entrepôt..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-transparent border-none text-white w-full outline-none text-sm placeholder-slate-500"
        />
      </div>

      {/* Main List Table card */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/30">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-6">Référence</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Fournisseur</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Entrepôt</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Paiement</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total TTC</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    Chargement des bons d'achat...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-16 text-center text-slate-500">
                    <ShoppingCart size={48} className="mx-auto mb-4 text-slate-600" />
                    <p>Aucun bon d'achat disponible.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750/30 transition-colors">
                    <td className="p-4 pl-6 font-bold text-white">{item.reference}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <User size={14} className="text-slate-500" />
                        <span>{item.fournisseur?.nom || `ID: ${item.fournisseur_id}`}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Building2 size={14} className="text-slate-500" />
                        <span>{item.entrepot?.nom || `ID: ${item.entrepot_id}`}</span>
                      </div>
                    </td>
                    <td className="p-4">{getStatusBadge(item.statut)}</td>
                    <td className="p-4">{getPaymentBadge(item.statut_paiement)}</td>
                    <td className="p-4 font-bold text-emerald-400">
                      {Number(item.montant_total).toFixed(2)} MAD
                    </td>
                    <td className="p-4 text-slate-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(item)} 
                          className="bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 p-2 rounded-lg cursor-pointer transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => deleteAchat(item.id, item.reference)} 
                          className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 p-2 rounded-lg cursor-pointer transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Popup Form container */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart size={20} className="text-blue-500" />
                <span>{editId ? 'Modifier le Bon d\'Achat' : 'Ajouter un Bon d\'Achat'}</span>
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={saveAchat} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Référence Achat *</label>
                  <input 
                    name="reference" 
                    value={formData.reference} 
                    onChange={handleInputChange} 
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm font-semibold" 
                    placeholder="Reference..." 
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Montant Total (MAD) *</label>
                  <input 
                    type="number"
                    name="montant_total" 
                    value={formData.montant_total} 
                    onChange={handleInputChange} 
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm font-semibold text-emerald-400" 
                    placeholder="0.00" 
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Fournisseur *</label>
                  <select 
                    name="fournisseur_id" 
                    value={formData.fournisseur_id} 
                    onChange={handleInputChange} 
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm"
                    required
                  >
                    <option value="" disabled>Sélectionner un fournisseur</option>
                    {fournisseurs.map(f => (
                      <option key={f.id} value={f.id} style={{ color: 'black' }}>
                        {f.nom} ({f.entreprise || 'Privé'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Entrepôt Cible *</label>
                  <select 
                    name="entrepot_id" 
                    value={formData.entrepot_id} 
                    onChange={handleInputChange} 
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm"
                    required
                  >
                    <option value="" disabled>Sélectionner un entrepôt</option>
                    {entrepots.map(e => (
                      <option key={e.id} value={e.id} style={{ color: 'black' }}>
                        {e.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Statut de Livraison</label>
                  <select 
                    name="statut" 
                    value={formData.statut} 
                    onChange={handleInputChange} 
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm"
                  >
                    <option value="Commande" style={{ color: 'black' }}>Commandé</option>
                    <option value="Attente" style={{ color: 'black' }}>En attente</option>
                    <option value="Recu" style={{ color: 'black' }}>Reçu</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Statut de Paiement</label>
                  <select 
                    name="statut_paiement" 
                    value={formData.statut_paiement} 
                    onChange={handleInputChange} 
                    className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm"
                  >
                    <option value="Non paye" style={{ color: 'black' }}>Non payé</option>
                    <option value="Partiel" style={{ color: 'black' }}>Partiel</option>
                    <option value="Paye" style={{ color: 'black' }}>Payé</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Notes / Remarques</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange} 
                  rows="3" 
                  className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm resize-none" 
                  placeholder="Notes de commande..." 
                />
              </div>

              {/* Modal Actions Footer */}
              <div className="pt-6 border-t border-slate-800 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)} 
                  className="flex items-center gap-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer"
                >
                  <X size={15} /> <span>Annuler</span>
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <Check size={15} /> <span>{isSaving ? 'Enregistrement...' : editId ? 'Modifier' : 'Ajouter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
