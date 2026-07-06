import React, { useState, useEffect } from 'react';
import { X, FileText, Download, User, Building2, Calendar, Hash } from 'lucide-react';
import api from '../../services/api';

export default function AchatDetailModal({ achatId, onClose }) {
  const [achat, setAchat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchat();
  }, [achatId]);

  const fetchAchat = async () => {
    try {
      const res = await api.get(`/achats/${achatId}`);
      setAchat(res.data);
    } catch (error) {
      console.error('Erreur chargement achat:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    window.open(`http://localhost:8000/api/achats/${achatId}/pdf`, '_blank');
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl">Chargement...</div>
    </div>
  );

  if (!achat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl text-[#495057]">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#dee2e6] bg-white sticky top-0 z-10">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="text-[#2563eb]" />
            Détail d'Achat : {achat.reference}
          </h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={downloadPdf}
              className="flex items-center gap-1.5 border border-[#ced4da] bg-white hover:bg-[#f8f9fa] px-3 py-1.5 rounded-md text-[13px] transition-colors cursor-pointer"
            >
              <Download size={14} /> PDF
            </button>
            <button onClick={onClose} className="text-[#adb5bd] hover:text-[#495057] cursor-pointer">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white p-4 rounded-md border border-[#dee2e6] mb-6 shadow-sm">
            <div>
              <p className="text-[12px] text-[#6c757d] font-semibold flex items-center gap-1"><Hash size={12}/> Référence</p>
              <p className="font-bold mt-1 text-[14px]">{achat.reference}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6c757d] font-semibold flex items-center gap-1"><User size={12}/> Fournisseur</p>
              <p className="font-bold mt-1 text-[14px]">{achat.fournisseur?.nom}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6c757d] font-semibold flex items-center gap-1"><Building2 size={12}/> Entrepôt</p>
              <p className="font-bold mt-1 text-[14px]">{achat.entrepot?.nom}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6c757d] font-semibold flex items-center gap-1"><Calendar size={12}/> Date</p>
              <p className="font-bold mt-1 text-[14px]">{new Date(achat.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Lignes */}
          <h3 className="font-semibold text-[15px] mb-3">Produits commandés</h3>
          <div className="bg-white border border-[#dee2e6] rounded-md overflow-x-auto shadow-sm">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                <tr>
                  <th className="p-3 font-semibold">Produit</th>
                  <th className="p-3 font-semibold text-center">Quantité</th>
                  <th className="p-3 font-semibold text-right">Prix Unitaire</th>
                  <th className="p-3 font-semibold text-right">Sous-total</th>
                </tr>
              </thead>
              <tbody>
                {achat.lignes && achat.lignes.length > 0 ? (
                  achat.lignes.map((ligne, idx) => (
                    <tr key={idx} className="border-b border-[#dee2e6] last:border-0 hover:bg-[#f8f9fa]">
                      <td className="p-3">{ligne.produit?.nom || 'N/A'}</td>
                      <td className="p-3 text-center">{ligne.quantite}</td>
                      <td className="p-3 text-right">{Number(ligne.cout_unitaire).toFixed(2)} MAD</td>
                      <td className="p-3 text-right font-semibold">{Number(ligne.sous_total).toFixed(2)} MAD</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="p-4 text-center text-[#6c757d]">Aucune ligne trouvée.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="flex justify-end mt-4">
            <div className="bg-white border border-[#dee2e6] rounded-md p-4 w-64 shadow-sm">
              <div className="flex justify-between mb-2 text-[13px]">
                <span className="text-[#6c757d] font-semibold">Statut :</span>
                <span>{achat.statut}</span>
              </div>
              <div className="flex justify-between mb-2 text-[13px]">
                <span className="text-[#6c757d] font-semibold">Paiement :</span>
                <span>{achat.statut_paiement}</span>
              </div>
              <div className="border-t border-[#dee2e6] my-2"></div>
              <div className="flex justify-between font-bold text-[15px] text-[#2563eb]">
                <span>Total TTC :</span>
                <span>{Number(achat.montant_total).toFixed(2)} MAD</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
