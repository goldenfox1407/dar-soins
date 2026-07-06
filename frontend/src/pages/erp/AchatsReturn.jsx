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
      <div className="flex items-center justify-center min-h-[400px] text-slate-800">
        Chargement des détails de l'achat...
      </div>
    );
  }

  return (
    <div className="animate-fade-in text-slate-800 min-h-screen pb-12">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
            <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-800 transition-colors mr-2">
              <ChevronLeft size={24} />
            </button>
            <span className="text-[22px] font-medium">Créer un Retour d'Achat</span>
          </h1>
          <div className="text-[13px] text-slate-500 mt-1 ml-10 flex gap-2 items-center">
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/gestionnaire/achats')}>Achats</span>
            <ChevronRight size={14} />
            <span className="text-slate-400">Retour d'Achat</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden p-6 border border-slate-200">
        <form onSubmit={handleSubmit}>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input 
                type="date" 
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence Retour *</label>
              <input 
                type="text" 
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                className="w-full border border-slate-300 bg-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none"
                required
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fournisseur</label>
              <input 
                type="text" 
                value={formData.fournisseur_nom}
                className="w-full border border-slate-300 bg-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entrepôt</label>
              <input 
                type="text" 
                value={formData.entrepot_nom}
                className="w-full border border-slate-300 bg-slate-50 rounded-md px-3 py-2 text-sm focus:outline-none"
                readOnly
              />
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-800 mb-2">Produits de la commande d'origine ({purchase?.reference})</h3>
            <div className="border border-slate-200 rounded-md overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3 font-semibold">Produit</th>
                    <th className="p-3 font-semibold text-right">Coût Unitaire</th>
                    <th className="p-3 font-semibold text-center">Quantité Achetée</th>
                    <th className="p-3 font-semibold text-center w-36">Quantité à Retourner</th>
                    <th className="p-3 font-semibold text-right">Sous-total Retour</th>
                  </tr>
                </thead>
                <tbody>
                  {lignes.map((ligne) => (
                    <tr key={ligne.produit_id} className="border-b border-slate-200 last:border-0 hover:bg-slate-50">
                      <td className="p-3">{ligne.nom}</td>
                      <td className="p-3 text-right">{ligne.cout_unitaire.toFixed(2)} MAD</td>
                      <td className="p-3 text-center text-slate-500 font-medium">{ligne.quantite_achetee}</td>
                      <td className="p-3 text-center">
                        <input 
                          type="number" 
                          min="0"
                          max={ligne.quantite_achetee}
                          value={ligne.quantite_retournee} 
                          onChange={(e) => handleQtyChange(ligne.produit_id, e.target.value)}
                          className="w-20 text-center border border-slate-300 rounded-md py-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3 text-right font-semibold text-blue-600">
                        {calculateSubtotal(ligne).toFixed(2)} MAD
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full max-w-xs bg-slate-50 p-4 border border-slate-200 rounded-md">
              <div className="flex justify-between font-bold text-base text-blue-600">
                <span>Total Retour :</span>
                <span>{grandTotal.toFixed(2)} MAD</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut *</label>
              <select 
                name="statut" 
                value={formData.statut}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="Termine">Terminé</option>
                <option value="En attente">En attente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="2"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-6 py-2 bg-white border border-slate-300 rounded-md text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-6 py-2 rounded-md font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Check size={16} /> {isSubmitting ? 'Enregistrement...' : 'Enregistrer le Retour'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
