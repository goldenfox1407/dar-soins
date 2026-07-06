import React, { useState, useEffect } from 'react';
import { X, List, Trash2 } from 'lucide-react';
import api from '../../services/api';

export default function PaymentListModal({ achatId, reference, onClose }) {
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPaiements();
  }, [achatId]);

  const fetchPaiements = async () => {
    try {
      const res = await api.get(`/achats/${achatId}/paiements`);
      setPaiements(res.data);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg p-8 shadow-xl">Chargement...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#f8f9fa] border border-[#dee2e6] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-xl text-[#495057] flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#dee2e6] bg-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <List className="text-[#2563eb]" />
            Paiements : {reference}
          </h2>
          <button onClick={onClose} className="text-[#adb5bd] hover:text-[#495057] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-white border border-[#dee2e6] rounded-md overflow-x-auto shadow-sm">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#f8f9fa] border-b border-[#dee2e6]">
                <tr>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Référence</th>
                  <th className="p-3 font-semibold">Montant</th>
                  <th className="p-3 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody>
                {paiements.length > 0 ? (
                  paiements.map((p) => (
                    <tr key={p.id} className="border-b border-[#dee2e6] last:border-0 hover:bg-[#f8f9fa]">
                      <td className="p-3 whitespace-nowrap">{new Date(p.date_transaction).toLocaleDateString()}</td>
                      <td className="p-3 font-mono">{p.reference}</td>
                      <td className="p-3 font-bold text-[#28a745]">{Number(p.montant).toFixed(2)} MAD</td>
                      <td className="p-3 text-[#6c757d] text-[12px]">{p.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-[#6c757d]">Aucun paiement enregistré pour cet achat.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
