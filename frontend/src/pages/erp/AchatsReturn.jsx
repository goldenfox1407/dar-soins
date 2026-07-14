import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AchatsReturn() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchase, setPurchase] = useState(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().slice(0, 10),
    reference: '',
    fournisseur_nom: '',
    entrepot_nom: '',
    statut: 'Termine',
    notes: ''
  });

  const [lignes, setLignes] = useState([]);

  useEffect(() => {
    fetchPurchaseDetails();
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      const res = await api.get(`/achats/${id}`);
      const a = res.data.data || res.data;
      setPurchase(a);
      
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const refReturn = `RT-ACH-${todayStr}-${randNum}`;

      setFormData({
        date: new Date().toISOString().slice(0, 10),
        reference: refReturn,
        fournisseur_nom: a.fournisseur?.nom || 'N/A',
        entrepot_nom: a.entrepot?.nom || 'N/A',
        statut: 'Termine',
        notes: ''
      });

      if (a.lignes) {
        setLignes(a.lignes.map(l => ({
          produit_id: l.produit_id,
          nom: l.produit?.nom || 'Produit',
          cout_unitaire: Number(l.cout_unitaire),
          quantite_achetee: Number(l.quantite),
          quantite_retournee: 0,
          discount: Number(l.discount || 0),
          tax_percent: Number(l.tax_percent || 0),
        })));
      }
    } catch (e) {
      console.error(e);
      alert('Erreur lors du chargement des détails de l\'achat.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQtyChange = (produit_id, val) => {
    const qty = parseInt(val) || 0;
    setLignes(lignes.map(l => {
      if (l.produit_id === produit_id) {
        const clampedQty = Math.max(0, Math.min(l.quantite_achetee, qty));
        return { ...l, quantite_retournee: clampedQty };
      }
      return l;
    }));
  };

  const calculateSubtotal = (ligne) => {
    const base = ligne.cout_unitaire * ligne.quantite_retournee;
    const afterDiscount = base - (ligne.discount || 0);
    const tax = afterDiscount * ((ligne.tax_percent || 0) / 100);
    return Math.max(0, afterDiscount + tax);
  };

  const grandTotal = lignes.reduce((sum, l) => sum + calculateSubtotal(l), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const activeLignes = lignes.filter(l => l.quantite_retournee > 0);
    if (activeLignes.length === 0) {
      alert('Veuillez retourner au moins un produit avec une quantité supérieure à 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        reference: formData.reference,
        achat_id: id,
        fournisseur_id: purchase.fournisseur_id,
        entrepot_id: purchase.entrepot_id,
        statut: formData.statut,
        montant_total: grandTotal,
        notes: formData.notes,
        lignes: activeLignes.map(l => ({
          produit_id: l.produit_id,
          quantite: l.quantite_retournee,
          cout_unitaire: l.cout_unitaire,
          sous_total: calculateSubtotal(l)
        }))
      };

      await api.post('/retour-achats', payload);
      alert('Retour d\'achat enregistré avec succès !');
      navigate('/gestionnaire/achats');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création du retour.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', color: 'var(--text-muted)' }}>
        Chargement des détails de l'achat...
      </div>
    );
  }

  return (
    <div className="erp-page animate-fade-in">
      <header className="erp-page-header">
        <div>
          <h1 className="erp-page-title flex items-center gap-2">
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <ChevronLeft size={24} />
            </button>
            <span>Créer un Retour d'Achat</span>
          </h1>
          <div className="erp-page-subtitle" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '32px' }}>
            <span className="hover:underline cursor-pointer" onClick={() => navigate('/gestionnaire/achats')}>Achats</span>
            <ChevronRight size={14} />
            <span>Retour d'Achat</span>
          </div>
        </div>
      </header>

      <div className="erp-card p-6">
        <form onSubmit={handleSubmit}>
          
          <div className="erp-form-grid mb-6" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
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
              <label>Référence Retour *</label>
              <input 
                type="text" 
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                style={{ background: '#F8FAFC' }}
                required
                readOnly
              />
            </div>
            <div className="erp-form-group">
              <label>Fournisseur</label>
              <input 
                type="text" 
                value={formData.fournisseur_nom}
                style={{ background: '#F8FAFC' }}
                readOnly
              />
            </div>
            <div className="erp-form-group">
              <label>Entrepôt</label>
              <input 
                type="text" 
                value={formData.entrepot_nom}
                style={{ background: '#F8FAFC' }}
                readOnly
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold text-muted mb-2">Produits de la commande d'origine ({purchase?.reference})</h3>
            <div className="erp-table-container" style={{ border: '1px solid var(--card-border)', borderRadius: '8px' }}>
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th style={{ textAlign: 'right' }}>Coût Unitaire</th>
                    <th style={{ textAlign: 'center' }}>Quantité Achetée</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Quantité à Retourner</th>
                    <th style={{ textAlign: 'right' }}>Sous-total Retour</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => (
                    <tr key={ligne.produit_id}>
                      <td>{ligne.nom}</td>
                      <td style={{ textAlign: 'right' }}>{ligne.cout_unitaire.toFixed(2)} MAD</td>
                      <td style={{ textAlign: 'center' }} className="text-muted font-medium">{ligne.quantite_achetee}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input 
                          type="number" 
                          min="0"
                          max={ligne.quantite_achetee}
                          value={ligne.quantite_retournee} 
                          onChange={(e) => handleQtyChange(ligne.produit_id, e.target.value)}
                          style={{ width: '80px', padding: '6px', textAlign: 'center', border: '1px solid var(--card-border)', borderRadius: '6px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary-color)' }}>
                        {calculateSubtotal(ligne).toFixed(2)} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
            <div className="glass-panel" style={{ width: '100%', maxWidth: '280px', padding: '16px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: 'var(--primary-color)' }}>
                <span>Total Retour :</span>
                <span>{grandTotal.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div className="erp-form-grid mb-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="erp-form-group">
              <label>Statut *</label>
              <select 
                name="statut" 
                value={formData.statut}
                onChange={handleInputChange}
                required
              >
                <option value="Termine">Terminé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
            <div className="erp-form-group">
              <label>Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                placeholder="Quelques mots..."
              ></textarea>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--card-border)' }}>
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="erp-btn-secondary"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="erp-btn-primary"
            >
              <Check size={16} /> {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Retour'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
