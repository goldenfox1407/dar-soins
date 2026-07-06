import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Search, Plus, X, ShoppingCart, Check, ChevronLeft, Barcode, Trash2, ChevronRight } from 'lucide-react';

export default function AchatsCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  
  const [fournisseurs, setFournisseurs] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    fournisseur_id: '',
    entrepot_id: '',
    statut: 'Recu',
    statut_paiement: 'Non paye',
    notes: '',
    order_tax: 0,
    discount: 0,
    shipping: 0
  });

  // Order Items
  const [lignes, setLignes] = useState([]);

  useEffect(() => {
    loadOptions();
    if (isEdit) {
      fetchAchat();
    }
  }, [id]);

  const fetchAchat = async () => {
    try {
      const res = await api.get(`/achats/${id}`);
      const a = res.data.data || res.data;
      setFormData({
        date: a.date ? new Date(a.date).toISOString().slice(0, 10) : (a.created_at ? new Date(a.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
        fournisseur_id: a.fournisseur_id,
        entrepot_id: a.entrepot_id,
        statut: a.statut,
        statut_paiement: a.statut_paiement,
        notes: a.notes || '',
        order_tax: a.order_tax || 0,
        discount: a.discount || 0,
        shipping: a.shipping || 0
      });
      if (a.lignes) {
        setLignes(a.lignes.map(l => ({
          produit_id: l.produit_id,
          nom: l.produit?.nom || 'Produit',
          cout_unitaire: l.cout_unitaire,
          quantite: l.quantite,
          discount: l.discount || 0,
          tax_percent: l.tax_percent || 0,
          stock_actuel: l.produit?.quantite_stock || 0
        })));
      }
    } catch (e) {
      console.error('Erreur chargement achat:', e);
      alert('Erreur chargement achat');
    }
  };

  const loadOptions = async () => {
    try {
      const [rF, rE, rP] = await Promise.all([
        api.get('/fournisseurs'),
        api.get('/entrepots'),
        api.get('/produits')
      ]);
      setFournisseurs(rF.data?.data || rF.data || []);
      setEntrepots(rE.data?.data || rE.data || []);
      setProducts(rP.data?.data || rP.data || []);
    } catch (error) {
      console.error('Erreur chargement options:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateReference = () => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randStr = Math.floor(1000 + Math.random() * 9000);
    return `ACH-${dateStr}-${randStr}`;
  };

  const addProductToOrder = (product) => {
    const existing = lignes.find(l => l.produit_id === product.id);
    if (existing) {
      updateLigne(product.id, 'quantite', existing.quantite + 1);
    } else {
      setLignes([...lignes, {
        produit_id: product.id,
        nom: product.nom,
        cout_unitaire: product.prix_achat || 0,
        quantite: 1,
        discount: 0,
        tax_percent: 0,
        stock_actuel: product.quantite_stock || 0
      }]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const updateLigne = (produit_id, field, value) => {
    setLignes(lignes.map(ligne => {
      if (ligne.produit_id === produit_id) {
        return { ...ligne, [field]: Number(value) >= 0 ? Number(value) : 0 };
      }
      return ligne;
    }));
  };

  const removeLigne = (produit_id) => {
    setLignes(lignes.filter(l => l.produit_id !== produit_id));
  };

  const calculateSubtotal = (ligne) => {
    const base = ligne.cout_unitaire * ligne.quantite;
    const afterDiscount = base - (ligne.discount || 0);
    const taxAmount = afterDiscount * ((ligne.tax_percent || 0) / 100);
    return afterDiscount + taxAmount;
  };

  const totalItems = lignes.reduce((acc, l) => acc + calculateSubtotal(l), 0);
  
  const grandTotal = totalItems 
    + Number(formData.order_tax || 0) 
    + Number(formData.shipping || 0) 
    - Number(formData.discount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lignes.length === 0) {
      alert('Veuillez ajouter au moins un produit.');
      return;
    }
    if (!formData.fournisseur_id || !formData.entrepot_id) {
      alert('Veuillez sélectionner un fournisseur et un entrepôt.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        reference: generateReference(),
        fournisseur_id: formData.fournisseur_id,
        entrepot_id: formData.entrepot_id,
        statut: formData.statut,
        statut_paiement: formData.statut_paiement,
        notes: formData.notes,
        order_tax: formData.order_tax,
        discount: formData.discount,
        shipping: formData.shipping,
        montant_total: grandTotal,
        lignes: lignes.map(l => ({
          produit_id: l.produit_id,
          quantite: l.quantite,
          cout_unitaire: l.cout_unitaire,
          discount: l.discount,
          tax_percent: l.tax_percent,
          sous_total: calculateSubtotal(l)
        }))
      };

      if (isEdit) {
        await api.put(`/achats/${id}`, payload);
      } else {
        await api.post('/achats', payload);
      }
      navigate('/gestionnaire/achats');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde de l\'achat.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.code_barre && p.code_barre.includes(searchQuery))
  ).slice(0, 8);

  return (
    <div className="animate-fade-in text-slate-200 min-h-screen pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white transition-colors mr-2">
              <ChevronLeft size={24} />
            </button>
            <span className="text-[22px] font-medium text-slate-800">
              {isEdit ? "Modifier l'Achat" : "Ajouter un Achat"}
            </span>
          </h1>
          <div className="text-[13px] text-slate-500 mt-1 ml-10 flex gap-2 items-center">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/gestionnaire/achats')}>Achats</span>
            <ChevronRight size={14} />
            <span className="text-slate-400">{isEdit ? "Modifier" : "Ajouter"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden text-slate-800 p-6 border border-slate-200">
        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur *</label>
              <div className="flex">
                <select 
                  name="fournisseur_id"
                  value={formData.fournisseur_id}
                  onChange={handleInputChange}
                  className="flex-1 border border-slate-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  required
                >
                  <option value="" disabled>Choisir un Fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
                <button type="button" onClick={() => navigate('/gestionnaire/gens/fournisseurs')} className="bg-purple-700 hover:bg-purple-800 text-white px-3 rounded-r-md flex items-center justify-center transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entrepôt *</label>
              <select 
                name="entrepot_id"
                value={formData.entrepot_id}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="" disabled>Choisir un Entrepôt</option>
                {entrepots.map(e => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom du Produit</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Barcode className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Scanner/Rechercher un produit par code ou nom"
                className="w-full pl-10 pr-3 py-3 border border-slate-300 rounded-md text-sm bg-slate-50 focus:outline-none focus:bg-white focus:ring-1 focus:ring-purple-500"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              
              {showDropdown && searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b border-slate-100 last:border-0"
                        onClick={() => addProductToOrder(p)}
                      >
                        <div className="font-medium">{p.nom}</div>
                        <div className="text-xs text-slate-500">{p.code_barre || 'Sans code'} • Stock: {p.quantite_stock || 0}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">Aucun produit trouvé</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Produits de la commande *</h3>
            <div className="border border-slate-200 rounded-md overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-200 text-slate-700 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3 w-12">#</th>
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3 w-32">Coût Unitaire Net</th>
                    <th className="px-4 py-3 w-28">Stock Actuel</th>
                    <th className="px-4 py-3 w-36">Qté</th>
                    <th className="px-4 py-3 w-28">Remise</th>
                    <th className="px-4 py-3 w-28">Taxe %</th>
                    <th className="px-4 py-3 w-32">Sous-total</th>
                    <th className="px-4 py-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lignes.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                        Aucune donnée disponible
                      </td>
                    </tr>
                  ) : (
                    lignes.map((ligne, idx) => (
                      <tr key={ligne.produit_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-purple-700">{ligne.nom}</td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" 
                            min="0" step="0.01"
                            value={ligne.cout_unitaire} 
                            onChange={(e) => updateLigne(ligne.produit_id, 'cout_unitaire', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <span className="border border-amber-300 text-amber-600 bg-amber-50 px-2 py-0.5 rounded text-xs">
                            {ligne.stock_actuel}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center border border-slate-300 rounded overflow-hidden">
                            <button type="button" onClick={() => updateLigne(ligne.produit_id, 'quantite', Math.max(1, ligne.quantite - 1))} className="bg-purple-700 text-white px-2 py-1 hover:bg-purple-800">-</button>
                            <input 
                              type="number" min="1" 
                              value={ligne.quantite} 
                              onChange={(e) => updateLigne(ligne.produit_id, 'quantite', e.target.value)}
                              className="w-12 text-center text-sm py-1 focus:outline-none"
                            />
                            <button type="button" onClick={() => updateLigne(ligne.produit_id, 'quantite', ligne.quantite + 1)} className="bg-purple-700 text-white px-2 py-1 hover:bg-purple-800">+</button>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" min="0" step="0.01"
                            value={ligne.discount} 
                            onChange={(e) => updateLigne(ligne.produit_id, 'discount', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="number" min="0" step="0.01"
                            value={ligne.tax_percent} 
                            onChange={(e) => updateLigne(ligne.produit_id, 'tax_percent', e.target.value)}
                            className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-purple-500"
                          />
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          MAD {calculateSubtotal(ligne).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" onClick={() => removeLigne(ligne.produit_id)} className="text-red-400 hover:text-red-600">
                            <X size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {lignes.length > 0 && (
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-md">
                <table className="w-full text-sm text-slate-700">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2 font-medium">Taxe de commande</td>
                      <td className="py-2 text-right">MAD {Number(formData.order_tax || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Remise</td>
                      <td className="py-2 text-right">MAD {Number(formData.discount || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">Frais de livraison</td>
                      <td className="py-2 text-right">MAD {Number(formData.shipping || 0).toFixed(2)}</td>
                    </tr>
                    <tr className="text-base">
                      <td className="py-3 font-bold text-slate-900">Total</td>
                      <td className="py-3 text-right font-bold text-slate-900">MAD {grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Taxe de commande</label>
              <div className="flex">
                <input 
                  type="number" min="0" step="0.01" name="order_tax" value={formData.order_tax} onChange={handleInputChange}
                  className="flex-1 border border-slate-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 rounded-r-md text-slate-500 text-sm flex items-center">MAD</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Remise</label>
              <div className="flex">
                <input 
                  type="number" min="0" step="0.01" name="discount" value={formData.discount} onChange={handleInputChange}
                  className="flex-1 border border-slate-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 rounded-r-md text-slate-500 text-sm flex items-center">MAD</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Frais de livraison</label>
              <div className="flex">
                <input 
                  type="number" min="0" step="0.01" name="shipping" value={formData.shipping} onChange={handleInputChange}
                  className="flex-1 border border-slate-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                />
                <span className="bg-slate-100 border border-l-0 border-slate-300 px-3 py-2 rounded-r-md text-slate-500 text-sm flex items-center">MAD</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut *</label>
            <select 
              name="statut" value={formData.statut} onChange={handleInputChange}
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="Recu">Reçu</option>
              <option value="En attente">En attente</option>
              <option value="Commande">Commandé</option>
            </select>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
            <textarea 
              name="notes" value={formData.notes} onChange={handleInputChange}
              rows="4"
              className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Quelques mots..."
            ></textarea>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
            >
              <Check size={16} /> <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
