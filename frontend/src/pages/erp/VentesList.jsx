import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, Clock, XCircle, FileText, Eye } from 'lucide-react';
import VenteDetailsModal from './VenteDetailsModal';

export default function VentesList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIntervention, setSelectedIntervention] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/ventes').catch(() => ({ data: [] }));
      setData(response.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'en_attente_affectation': return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold">À Affecter</span>;
      case 'en_attente_reponse_infirmier': return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold">Attente Infirmier</span>;
      case 'infirmier_accepte': return <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-semibold">Infirmier OK (Générer Devis)</span>;
      case 'devis_genere': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">Devis Généré (À Envoyer)</span>;
      case 'en_attente_reponse_client': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-semibold">Attente Client</span>;
      case 'acceptee': return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-xs font-semibold">Confirmée</span>;
      case 'annulee': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold">Annulée</span>;
      default: return <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">{statut}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 animate-fade-in" style={{ padding: '2rem' }}>
      <header className="flex justify-between items-center mb-6" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-2xl font-bold" style={{ fontSize: '1.8rem', color: '#1E293B' }}>Ventes / Interventions</h1>
          <p className="text-slate-500 text-sm mt-1">Gérez les demandes de soins, l'affectation et les devis.</p>
        </div>
      </header>

      {loading ? (
        <div className="text-center p-8 text-slate-500">Chargement...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Date Demande</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Client</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Produit (Soin/Garde)</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Statut</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Infirmier Affecté</th>
                <th style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Aucune vente / intervention pour le moment.
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(item.created_at).toLocaleString('fr-FR')}</td>
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{item.client?.user ? `${item.client.user.nom} ${item.client.user.prenom || ''}` : 'Inconnu'}</td>
                    <td style={{ padding: '1rem' }}>{item.produit?.nom}</td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(item.statut)}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{item.infirmier?.user ? `${item.infirmier.user.nom} ${item.infirmier.user.prenom || ''}` : 'Non affecté'}</td>
                    <td style={{ padding: '1rem' }}>
                      <button 
                        onClick={() => setSelectedIntervention(item)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-colors border border-slate-300"
                      >
                        <Eye size={16} /> Détails & Actions
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedIntervention && (
        <VenteDetailsModal 
          intervention={selectedIntervention} 
          onClose={() => setSelectedIntervention(null)}
          onRefresh={fetchData}
        />
      )}
    </div>
  );
}
