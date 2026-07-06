import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit2, Trash2, X, Check, Building2, Phone, MapPin } from 'lucide-react';

export default function EntrepotsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '', localisation: '', telephone: '', est_principal: false
  });
  const [editId, setEditId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entrepots');
      setData(response.data?.data || response.data?.data || response.data || []);
    } catch (error) {
      console.error('Erreur de chargement des entrepôts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const openAddModal = () => {
    setFormData({
      nom: '', localisation: '', telephone: '', est_principal: false
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (entrepot) => {
    setFormData({
      nom: entrepot.nom || '',
      localisation: entrepot.localisation || '',
      telephone: entrepot.telephone || '',
      est_principal: Boolean(entrepot.est_principal)
    });
    setEditId(entrepot.id);
    setShowModal(true);
  };

  const saveEntrepot = async (e) => {
    e.preventDefault();
    if (!formData.nom) {
      alert("Le nom de l'entrepôt est obligatoire.");
      return;
    }
    setIsSaving(true);
    try {
      if (editId) {
        await api.put(`/entrepots/${editId}`, formData);
      } else {
        await api.post('/entrepots', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert("Erreur lors de l'enregistrement de l'entrepôt");
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
        console.error('Erreur suppression:', error);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const filteredData = data.filter(item => 
    (item.nom?.toLowerCase() || '').includes(search.toLowerCase()) || 
    (item.localisation?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (item.telephone || '').includes(search)
  );

  return (
    <div className="animate-fade-in text-slate-200">
      
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <Building2 className="text-blue-500" size={24} />
            <span>Entrepôts & Dépôts</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gérez les localisations physiques de stockage et de distribution des matériels.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md shadow-blue-500/20 hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>Ajouter un entrepôt</span>
        </button>
      </div>

      {/* Search Input bar */}
      <div className="mb-6 flex max-w-md items-center bg-slate-900/50 border border-slate-700/80 rounded-xl px-4 py-2.5 shadow-inner">
        <Search size={18} className="text-slate-500 mr-2.5" />
        <input 
          type="text" 
          placeholder="Rechercher par nom, ville, téléphone..." 
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
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-6">Nom</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Localisation</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Téléphone</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    Chargement des entrepôts...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16 text-center text-slate-500">
                    <Building2 size={48} className="mx-auto mb-4 text-slate-600" />
                    <p>Aucun entrepôt disponible pour le moment.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-750/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        <span>{item.nom}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <MapPin size={14} className="text-slate-500" />
                        <span>{item.localisation || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Phone size={14} className="text-slate-500" />
                        <span>{item.telephone || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {item.est_principal ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Principal
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-700">
                          Secondaire
                        </span>
                      )}
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
                          onClick={() => deleteEntrepot(item.id, item.nom)} 
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
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-in">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 size={20} className="text-blue-500" />
                <span>{editId ? 'Modifier l\'Entrepôt' : 'Ajouter un Entrepôt'}</span>
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={saveEntrepot} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Nom de l'entrepôt *</label>
                <input 
                  name="nom" 
                  value={formData.nom} 
                  onChange={handleInputChange} 
                  className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm" 
                  placeholder="Ex: Dépôt Central..." 
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Adresse / Localisation</label>
                <input 
                  name="localisation" 
                  value={formData.localisation} 
                  onChange={handleInputChange} 
                  className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm" 
                  placeholder="Ex: Quartier Agdal, Rabat..." 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Téléphone</label>
                <input 
                  name="telephone" 
                  value={formData.telephone} 
                  onChange={handleInputChange} 
                  className="bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all text-sm" 
                  placeholder="Ex: +212 522 XXXXXX..." 
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input 
                  type="checkbox"
                  id="est_principal"
                  name="est_principal" 
                  checked={formData.est_principal} 
                  onChange={handleInputChange} 
                  className="w-4 h-4 rounded border-slate-750 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
                />
                <label htmlFor="est_principal" className="text-sm text-slate-300 font-medium cursor-pointer">
                  Définir comme entrepôt principal
                </label>
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
