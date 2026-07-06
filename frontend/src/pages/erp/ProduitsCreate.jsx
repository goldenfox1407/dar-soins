import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Package, Barcode, Image as ImageIcon } from 'lucide-react';
import api from '../../services/api';

export default function ProduitsCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Paramètres pour les selects
  const [categories, setCategories] = useState([]);
  const [marques, setMarques] = useState([]);
  const [unites, setUnites] = useState([]);

  const [formData, setFormData] = useState({
    nom: '',
    type: 'soin',
    code_barres: '',
    symbologie: 'CODE128',
    categorie_id: '',
    marque_id: '',
    unite_id: '',
    prix_client: '',
    prix_achat: '',
    stock_initial: 0,
    remuneration_soignant: '',
    gerer_stock: false,
    quantite_alerte: 0,
    description: '',
    type_remise: 'none',
    valeur_remise: 0,
    image: null
  });

  useEffect(() => {
    fetchParams();
  }, []);

  const fetchParams = async () => {
    try {
      const [catRes, marqRes, unitRes] = await Promise.all([
        api.get('/categories'),
        api.get('/marques'),
        api.get('/unites')
      ]);
      setCategories(catRes.data?.data || catRes.data || []);
      setMarques(marqRes.data?.data || marqRes.data || []);
      setUnites(unitRes.data?.data || unitRes.data || []);
    } catch (error) {
      console.error('Erreur chargement paramètres:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        let value = formData[key];
        if (typeof value === 'boolean') value = value ? 1 : 0;
        
        if (value !== null && value !== '') {
          data.append(key, value);
        }
      });

      await api.post('/produits', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/gestionnaire/produits');
    } catch (error) {
      const msg = error.response?.data?.message || "Erreur inconnue";
      const details = error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : "";
      alert(`Erreur lors de la création du produit: ${msg}\n${details}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-fade-in" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-2xl font-bold text-slate-800" style={{ fontSize: '1.8rem' }}>Ajouter un Produit</h1>
          <p className="text-slate-500 text-sm mt-1">Créez un nouveau produit, service ou soin.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/gestionnaire/produits')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors font-medium border border-slate-300">
            <X size={18} /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium shadow-sm">
            <Save size={18} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Colonne Principale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Package size={18} className="text-blue-600" /> Informations Générales
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nom du Produit *</label>
                <input type="text" name="nom" required value={formData.nom} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="ex: Paracétamol 500mg ou Visite à domicile" />
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Code-barres / SKU</label>
                  <div className="flex items-center bg-white border border-slate-300 rounded-md px-3">
                    <Barcode size={18} className="text-slate-400" />
                    <input type="text" name="code_barres" value={formData.code_barres} onChange={handleChange} className="w-full bg-transparent border-none text-slate-800 px-3 py-2 outline-none" placeholder="Généré auto si vide" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Symbologie Code-barres</label>
                  <select name="symbologie" value={formData.symbologie} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all">
                    <option value="CODE128">Code 128 (Recommandé)</option>
                    <option value="CODE39">Code 39</option>
                    <option value="EAN13">EAN-13</option>
                    <option value="UPC">UPC</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all custom-scrollbar" rows="4" placeholder="Description détaillée du produit ou du service..."></textarea>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">Tarification</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    {formData.type === 'consommable' ? 'Prix de vente (MAD) *' : 'Prix de vente Client (MAD) *'}
                  </label>
                  <input type="number" step="0.01" name="prix_client" required value={formData.prix_client} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="0.00" />
                </div>
                {formData.type === 'consommable' ? (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Prix d'achat (MAD)</label>
                    <input type="number" step="0.01" name="prix_achat" value={formData.prix_achat} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="0.00" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Coût / Rémunération Soignant (MAD)</label>
                    <input type="number" step="0.01" name="remuneration_soignant" value={formData.remuneration_soignant} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="0.00" />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Colonne Secondaire */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">Classification</h3>
              
              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Type *</label>
                <select name="type" required value={formData.type} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all">
                  <option value="soin">Soin / Service Médical</option>
                  <option value="garde">Garde / Équipement</option>
                  <option value="consommable">Consommable Médical</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Catégorie</label>
                <select name="categorie_id" value={formData.categorie_id} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all">
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Marque</label>
                <select name="marque_id" value={formData.marque_id} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all">
                  <option value="">Sélectionner une marque</option>
                  {marques.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Unité</label>
                <select name="unite_id" value={formData.unite_id} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all">
                  <option value="">Sélectionner une unité</option>
                  {unites.map(u => <option key={u.id} value={u.id}>{u.nom} ({u.nom_court})</option>)}
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">Stock</h3>
              
              {formData.type === 'consommable' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Initial</label>
                  <input type="number" name="stock_initial" value={formData.stock_initial} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="ex: 100" />
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <input type="checkbox" id="gerer_stock" name="gerer_stock" checked={formData.gerer_stock} onChange={handleChange} />
                <label htmlFor="gerer_stock" className="text-sm font-semibold text-slate-700 cursor-pointer">Gérer le stock</label>
              </div>

              {formData.gerer_stock && (
                <div className="animate-fade-in">
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Quantité d'alerte</label>
                  <input type="number" name="quantite_alerte" value={formData.quantite_alerte} onChange={handleChange} className="w-full bg-white border border-slate-300 rounded-md px-4 py-2 text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all" placeholder="ex: 5" />
                  <p className="text-xs text-slate-500 mt-1">Vous serez notifié quand le stock sera inférieur à cette quantité.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <ImageIcon size={18} className="text-blue-600" /> Image du Produit
              </h3>
              <div className="border-2 border-dashed border-slate-300 bg-white rounded-lg p-6 text-center text-slate-500 hover:border-blue-500 transition-colors relative">
                <p className="text-sm mb-2">{formData.image ? formData.image.name : 'Glissez-déposez une image ici ou cliquez pour parcourir.'}</p>
                <div className="relative inline-block mt-2">
                  <button type="button" className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-md border border-slate-300">Parcourir</button>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
