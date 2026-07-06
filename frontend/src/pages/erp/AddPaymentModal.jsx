import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Check } from 'lucide-react';
import api from '../../services/api';

export default function AddPaymentModal({ achatId, reference, dueAmount, onClose, onPaymentAdded }) {
  const [comptes, setComptes] = useState([]);
  const [formData, setFormData] = useState({
    montant: dueAmount > 0 ? dueAmount : 0,
    date_transaction: new Date().toISOString().slice(0, 10),
    type_paiement: 'Espèces',
    compte_id: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchComptes();
  }, []);

  const fetchComptes = async () => {
    try {
      const res = await api.get('/comptes-bancaires');
      const data = res.data?.data || res.data || [];
      setComptes(data);
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, compte_id: data[0].id }));
      }
    } catch (error) {
      console.error('Erreur comptes:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const savePayment = async (e) => {
    e.preventDefault();
    if (!formData.compte_id || formData.montant <= 0) {
      alert("Veuillez remplir tous les champs correctement.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post(`/achats/${achatId}/paiements`, formData);
      onPaymentAdded();
      onClose();
    } catch (error) {
      console.error('Erreur sauvegarde paiement:', error);
      alert("Erreur lors de l'enregistrement du paiement.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg max-w-lg w-full shadow-xl text-[#495057] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#dee2e6] bg-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PlusCircle className="text-[#2563eb]" />
            Créer Paiement : {reference}
          </h2>
          <button onClick={onClose} className="text-[#adb5bd] hover:text-[#495057] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={savePayment} className="p-6">
          <div className="bg-blue-50 text-blue-800 p-3 rounded-md mb-4 text-[13px] border border-blue-200">
            Montant restant dû estimé : <strong>{Number(dueAmount).toFixed(2)} MAD</strong>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[13px] font-semibold mb-1">Montant (MAD) *</label>
              <input 
                type="number" 
                name="montant" 
                step="0.01"
                value={formData.montant} 
                onChange={handleInputChange} 
                className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] text-[13px]" 
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1">Date *</label>
              <input 
                type="date" 
                name="date_transaction" 
                value={formData.date_transaction} 
                onChange={handleInputChange} 
                className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] text-[13px]" 
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[13px] font-semibold mb-1">Mode de paiement *</label>
              <select 
                name="type_paiement" 
                value={formData.type_paiement} 
                onChange={handleInputChange} 
                className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] text-[13px] bg-white"
              >
                <option value="Espèces">Espèces</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Virement">Virement</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold mb-1">Compte Cible *</label>
              <select 
                name="compte_id" 
                value={formData.compte_id} 
                onChange={handleInputChange} 
                className="w-full border border-[#ced4da] rounded-md px-3 py-2 outline-none focus:border-[#80bdff] text-[13px] bg-white"
                required
              >
                <option value="" disabled>Choisir un compte</option>
                {comptes.map(c => <option key={c.id} value={c.id}>{c.nom_compte} ({c.numero_compte})</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#dee2e6]">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 bg-white border border-[#ced4da] rounded-md text-[13px] font-semibold hover:bg-[#f8f9fa] transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-4 py-2 bg-[#2563eb] text-white rounded-md text-[13px] font-semibold flex items-center gap-2 hover:bg-[#1d4ed8] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Check size={14} /> {isSaving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
