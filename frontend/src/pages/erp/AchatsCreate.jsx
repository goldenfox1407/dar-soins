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
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title flex items-center gap-2">
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={24} />
            </button>
            <span>{isEdit ? "Modifier l'Achat" : "Ajouter un Achat"}</span>
          </h1>
          <div className="erp-page-subtitle" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '32px' }}>
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/gestionnaire/achats')}>Achats</span>
            <ChevronRight size={14} />
            <span>{isEdit ? "Modifier" : "Ajouter"}</span>
          </div>
        </div>
      </header>

      <div className="erp-card p-6">
        <form onSubmit={handleSubmit}>
          
          <div className="erp-form-grid mb-6">
            <div className="erp-form-group">
              <label>Date *</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="erp-form-group">
              <label>Fournisseur *</label>
              <div style={{ display: 'flex' }}>
                <select 
                  name="fournisseur_id"
                  value={formData.fournisseur_id}
                  onChange={handleInputChange}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, flex: 1 }}
                  required
                >
                  <option value="" disabled>Choisir un Fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </select>
                <button 
                  type="button" 
                  onClick={() => navigate('/gestionnaire/gens/fournisseurs')} 
                  className="erp-btn-primary"
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, padding: '0 12px' }}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div className="erp-form-group">
              <label>Entrepôt *</label>
              <select 
                name="entrepot_id"
                value={formData.entrepot_id}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Choisir un Entrepôt</option>
                {entrepots.map(e => (
                  <option key={e.id} value={e.id}>{e.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="erp-form-group mb-6">
            <label>Nom du Produit</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Barcode size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <input
                type="text"
                placeholder="Scanner/Rechercher un produit par code ou nom"
                style={{ paddingLeft: '40px', background: '#F8FAFC' }}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
              
              {showDropdown && searchQuery && (
                <div style={{ position: 'absolute', zIndex: 10, width: '100%', marginTop: '4px', background: '#FFFFFF', border: '1px solid var(--card-border)', borderRadius: '8px', boxShadow: 'var(--card-shadow-hover)', maxHeight: '240px', overflowY: 'auto' }}>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(p => (
                      <div 
                        key={p.id} 
                        style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
                        onClick={() => addProductToOrder(p)}
                      >
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{p.nom}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.code_barre || 'Sans code'} • Stock: {p.quantite_stock || 0}</div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>Aucun produit trouvé</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-muted mb-2">Produits de la commande *</h3>
            <div className="erp-table-container" style={{ border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Produit</th>
                    <th style={{ width: '150px' }}>Coût Unitaire Net</th>
                    <th style={{ width: '120px' }}>Stock Actuel</th>
                    <th style={{ width: '150px' }}>Qté</th>
                    <th style={{ width: '120px' }}>Remise</th>
                    <th style={{ width: '120px' }}>Taxe %</th>
                    <th style={{ width: '150px' }}>Sous-total</th>
                    <th style={{ width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8 text-muted">
                        Aucune donnée disponible
                      </td>
                    </tr>
                  ) : (
                    lignes.map((ligne, idx) => (
                      <tr key={ligne.produit_id}>
                        <td className="text-muted">{idx + 1}</td>
                        <td className="font-semibold" style={{ color: 'var(--primary-color)' }}>{ligne.nom}</td>
                        <td>
                          <input 
                            type="number" 
                            min="0" step="0.01"
                            value={ligne.cout_unitaire} 
                            onChange={(e) => updateLigne(ligne.produit_id, 'cout_unitaire', e.target.value)}
                            style={{ padding: '6px 10px', height: 'auto', border: '1px solid var(--card-border)', borderRadius: '6px' }}
                          />
                        </td>
                        <td>
                          <span className="status-badge warning" style={{ padding: '4px 8px' }}>
                            {ligne.stock_actuel}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--card-border)', borderRadius: '6px', overflow: 'hidden', width: 'fit-content', background: '#FFFFFF' }}>
                            <button type="button" onClick={() => updateLigne(ligne.produit_id, 'quantite', Math.max(1, ligne.quantite - 1))} style={{ background: 'var(--primary-color)', color: '#FFFFFF', border: 'none', width: '28px', height: '28px', cursor: 'pointer' }}>-</button>
                            <input 
                              type="number" min="1" 
                              value={ligne.quantite} 
                              onChange={(e) => updateLigne(ligne.produit_id, 'quantite', e.target.value)}
                              style={{ width: '40px', textAlignment: 'center', border: 'none', padding: '0', textAlign: 'center', height: 'auto' }}
                            />
                            <button type="button" onClick={() => updateLigne(ligne.produit_id, 'quantite', ligne.quantite + 1)} style={{ background: 'var(--primary-color)', color: '#FFFFFF', border: 'none', width: '28px', height: '28px', cursor: 'pointer' }}>+</button>
                          </div>
                        </td>
                        <td>
                          <input 
                            type="number" min="0" step="0.01"
                            value={ligne.discount} 
                            onChange={(e) => updateLigne(ligne.produit_id, 'discount', e.target.value)}
                            style={{ padding: '6px 10px', height: 'auto', border: '1px solid var(--card-border)', borderRadius: '6px' }}
                          />
                        </td>
                        <td>
                          <input 
                            type="number" min="0" step="0.01"
                            value={ligne.tax_percent} 
                            onChange={(e) => updateLigne(ligne.produit_id, 'tax_percent', e.target.value)}
                            style={{ padding: '6px 10px', height: 'auto', border: '1px solid var(--card-border)', borderRadius: '6px' }}
                          />
                        </td>
                        <td className="font-semibold">
                          MAD {calculateSubtotal(ligne).toFixed(2)}
                        </td>
                        <td className="text-center">
                          <button type="button" onClick={() => removeLigne(ligne.produit_id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <div style={{ width: '100%', maxWidth: '350px' }}>
                <table style={{ width: '100%', fontSize: '0.875rem' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Taxe de commande</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>MAD {Number(formData.order_tax || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Remise</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>MAD {Number(formData.discount || 0).toFixed(2)}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                      <td style={{ padding: '8px 0', color: 'var(--text-muted)' }}>Frais de livraison</td>
                      <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>MAD {Number(formData.shipping || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>Total</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-main)' }}>MAD {grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="erp-form-grid mb-6" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="erp-form-group">
              <label>Taxe de commande</label>
              <div style={{ display: 'flex' }}>
                <input 
                  type="number" min="0" step="0.01" name="order_tax" value={formData.order_tax} onChange={handleInputChange}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span style={{ background: '#F8FAFC', border: '1px solid var(--card-border)', borderLeft: 'none', padding: '10px 14px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MAD</span>
              </div>
            </div>
            <div className="erp-form-group">
              <label>Remise</label>
              <div style={{ display: 'flex' }}>
                <input 
                  type="number" min="0" step="0.01" name="discount" value={formData.discount} onChange={handleInputChange}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span style={{ background: '#F8FAFC', border: '1px solid var(--card-border)', borderLeft: 'none', padding: '10px 14px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MAD</span>
              </div>
            </div>
            <div className="erp-form-group">
              <label>Frais de livraison</label>
              <div style={{ display: 'flex' }}>
                <input 
                  type="number" min="0" step="0.01" name="shipping" value={formData.shipping} onChange={handleInputChange}
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                />
                <span style={{ background: '#F8FAFC', border: '1px solid var(--card-border)', borderLeft: 'none', padding: '10px 14px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>MAD</span>
              </div>
            </div>
          </div>

          <div className="erp-form-group mb-6">
            <label>Statut *</label>
            <select name="statut" value={formData.statut} onChange={handleInputChange}>
              <option value="Recu">Reçu</option>
              <option value="En attente">En attente</option>
              <option value="Commande">Commandé</option>
            </select>
          </div>

          <div className="erp-form-group mb-6">
            <label>Notes</label>
            <textarea 
              name="notes" value={formData.notes} onChange={handleInputChange}
              rows="4"
              placeholder="Notes complémentaires..."
            ></textarea>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={loading}
              className="erp-btn-primary"
            >
              <Check size={16} /> <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
