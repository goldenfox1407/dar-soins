import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Send, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { openOrDownloadPdf } from '../../utils/pdfViewer';

export default function DevisList() {
  const [devis, setDevis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevis();
  }, []);

  const fetchDevis = async () => {
    try {
      const res = await api.get('/devis');
      setDevis(res.data.data ? res.data.data : res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'brouillon': return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">Généré (Non envoyé)</span>;
      case 'envoye': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">Envoyé au Client</span>;
      case 'accepte': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold">Accepté</span>;
      case 'refuse': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">Refusé</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">{statut}</span>;
    }
  };

  const telechargerPdf = (id) => {
    openOrDownloadPdf(`/devis/${id}/pdf`, `devis_${id}.pdf`);
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ fontSize: '1.8rem', color: '#1E293B' }}>
            <FileText className="text-blue-600" /> Gestion des Devis
          </h1>
          <p className="text-slate-500 text-sm mt-1">Consultez et téléchargez les devis générés.</p>
        </div>
      </header>

      {loading ? (
        <div className="text-center p-8 text-slate-500">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Intervention</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Montant Total</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Aucun devis disponible pour le moment.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(item.created_at).toLocaleString('fr-FR')}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.intervention?.client?.user?.name || 'Inconnu'}</td>
                    <td style={{ padding: '1rem' }}>{item.intervention?.produit?.nom}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{item.montant_total} MAD</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(item.statut)}</td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => telechargerPdf(item.id)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                      >
                        <Download size={16} /> PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
