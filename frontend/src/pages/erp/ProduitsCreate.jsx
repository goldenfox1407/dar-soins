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
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title">Ajouter un Produit</h1>
          <p className="erp-page-subtitle">Créez un nouveau produit, service ou soin.</p>
        </div>
        <div className="erp-page-actions">
          <button onClick={() => navigate('/gestionnaire/produits')} className="erp-btn-secondary">
            <X size={16} /> Annuler
          </button>
          <button onClick={handleSubmit} disabled={loading} className="erp-btn-primary">
            <Save size={16} /> {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        <div className="erp-form-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          
          {/* Colonne Principale */}
          <div className="flex flex-col gap-6">
            
            <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--primary-color)' }}>
                <Package size={18} /> Informations Générales
              </h3>
              
              <div className="erp-form-group">
                <label>Nom du Produit *</label>
                <input type="text" name="nom" required value={formData.nom} onChange={handleChange} placeholder="ex: Paracétamol 500mg ou Visite à domicile" />
              </div>
              
              <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="erp-form-group">
                  <label>Code-barres / SKU</label>
                  <div style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', border: '1px solid var(--card-border)', borderRadius: '8px', padding: '0 10px' }}>
                    <Barcode size={18} style={{ color: 'var(--text-muted)' }} />
                    <input type="text" name="code_barres" value={formData.code_barres} onChange={handleChange} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', padding: '10px 8px' }} placeholder="Généré auto si vide" />
                  </div>
                </div>
                <div className="erp-form-group">
                  <label>Symbologie Code-barres</label>
                  <select name="symbologie" value={formData.symbologie} onChange={handleChange}>
                    <option value="CODE128">Code 128 (Recommandé)</option>
                    <option value="CODE39">Code 39</option>
                    <option value="EAN13">EAN-13</option>
                    <option value="UPC">UPC</option>
                  </select>
                </div>
              </div>

              <div className="erp-form-group">
                <label>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Description détaillée du produit ou du service..."></textarea>
              </div>
            </div>

            <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 className="text-lg font-bold">Tarification</h3>
              
              <div className="erp-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="erp-form-group">
                  <label>
                    {formData.type === 'consommable' ? 'Prix de vente (MAD) *' : 'Prix de vente Client (MAD) *'}
                  </label>
                  <input type="number" step="0.01" name="prix_client" required value={formData.prix_client} onChange={handleChange} placeholder="0.00" />
                </div>
                {formData.type === 'consommable' ? (
                  <div className="erp-form-group">
                    <label>Prix d'achat (MAD)</label>
                    <input type="number" step="0.01" name="prix_achat" value={formData.prix_achat} onChange={handleChange} placeholder="0.00" />
                  </div>
                ) : (
                  <div className="erp-form-group">
                    <label>Coût / Rémunération Soignant (MAD)</label>
                    <input type="number" step="0.01" name="remuneration_soignant" value={formData.remuneration_soignant} onChange={handleChange} placeholder="0.00" />
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Colonne Secondaire */}
          <div className="flex flex-col gap-6">
            
            <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 className="text-lg font-bold">Classification</h3>
              
              <div className="erp-form-group">
                <label>Type *</label>
                <select name="type" required value={formData.type} onChange={handleChange}>
                  <option value="soin">Soin / Service Médical</option>
                  <option value="garde">Garde / Équipement</option>
                  <option value="consommable">Consommable Médical</option>
                </select>
              </div>

              <div className="erp-form-group">
                <label>Catégorie</label>
                <select name="categorie_id" value={formData.categorie_id} onChange={handleChange}>
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
                </select>
              </div>

              <div className="erp-form-group">
                <label>Marque</label>
                <select name="marque_id" value={formData.marque_id} onChange={handleChange}>
                  <option value="">Sélectionner une marque</option>
                  {marques.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                </select>
              </div>

              <div className="erp-form-group">
                <label>Unité</label>
                <select name="unite_id" value={formData.unite_id} onChange={handleChange}>
                  <option value="">Sélectionner une unité</option>
                  {unites.map(u => <option key={u.id} value={u.id}>{u.nom} ({u.nom_court})</option>)}
                </select>
              </div>
            </div>

            <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 className="text-lg font-bold">Stock</h3>
              
              {formData.type === 'consommable' && (
                <div className="erp-form-group">
                  <label>Stock Initial</label>
                  <input type="number" name="stock_initial" value={formData.stock_initial} onChange={handleChange} placeholder="ex: 100" />
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input type="checkbox" id="gerer_stock" name="gerer_stock" checked={formData.gerer_stock} onChange={handleChange} />
                <label htmlFor="gerer_stock" className="text-sm font-semibold cursor-pointer">Gérer le stock</label>
              </div>

              {formData.gerer_stock && (
                <div className="erp-form-group animate-fade-in" style={{ marginTop: '8px' }}>
                  <label>Quantité d'alerte</label>
                  <input type="number" name="quantite_alerte" value={formData.quantite_alerte} onChange={handleChange} placeholder="ex: 5" />
                  <p className="text-xs text-muted">Vous serez notifié quand le stock sera inférieur à cette quantité.</p>
                </div>
              )}
            </div>

            <div className="erp-card p-6" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <ImageIcon size={18} style={{ color: 'var(--primary-color)' }} /> Image du Produit
              </h3>
              <div style={{ border: '2px dashed var(--card-border)', background: '#FFFFFF', borderRadius: '10px', padding: '20px', textAlign: 'center', color: 'var(--text-muted)', position: 'relative' }}>
                <p className="text-sm" style={{ marginBottom: '10px' }}>{formData.image ? formData.image.name : 'Glissez-déposez une image ici ou cliquez pour parcourir.'}</p>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <button type="button" className="erp-btn-secondary" style={{ padding: '8px 16px' }}>Parcourir</button>
                  <input type="file" name="image" accept="image/*" onChange={handleChange} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
