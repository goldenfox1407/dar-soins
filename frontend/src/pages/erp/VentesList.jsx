import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { CheckCircle, Clock, XCircle, FileText, Eye, TrendingUp, Calendar, User, Package } from 'lucide-react';
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
      case 'en_attente_affectation': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">À Affecter</span>;
      case 'en_attente_reponse_infirmier': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">Attente Infirmier</span>;
      case 'infirmier_accepte': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Infirmier OK (Générer Devis)</span>;
      case 'devis_genere': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">Devis Généré</span>;
      case 'en_attente_reponse_client': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">Attente Client</span>;
      case 'acceptee': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Confirmée</span>;
      case 'annulee': 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Annulée</span>;
      default: 
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-700">{statut}</span>;
    }
  };

  return (
    <div className="animate-fade-in text-slate-200">
      
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <TrendingUp className="text-blue-500" size={24} />
            <span>Ventes / Interventions</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gérez le cycle de vie des interventions : demandes de soins, affectations et validations.</p>
        </div>
      </div>

      {/* Main List Table card */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl overflow-hidden shadow-lg backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-700/60 bg-slate-900/30">
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pl-6">Date Demande</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Client</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Produit / Soin</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Statut</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Infirmier Affecté</th>
                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    Chargement des interventions...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-16 text-center text-slate-500">
                    <TrendingUp size={48} className="mx-auto mb-4 text-slate-600" />
                    <p>Aucune intervention enregistrée.</p>
                  </td>
                </tr>
              ) : (
                data.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-750/30 transition-colors">
                    {/* Date */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                        <Calendar size={14} className="text-slate-500" />
                        <span>{new Date(item.created_at).toLocaleString('fr-FR')}</span>
                      </div>
                    </td>
                    {/* Client */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                        <User size={14} className="text-slate-500" />
                        <span>{item.client?.user ? `${item.client.user.nom} ${item.client.user.prenom || ''}` : 'Inconnu'}</span>
                      </div>
                    </td>
                    {/* Produit */}
                    <td className="p-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Package size={14} className="text-slate-500" />
                        <span>{item.produit?.nom}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td className="p-4">{getStatusBadge(item.statut)}</td>
                    {/* Infirmier */}
                    <td className="p-4">
                      <span className={item.infirmier?.user ? 'text-slate-300 font-semibold' : 'text-slate-500 italic text-sm'}>
                        {item.infirmier?.user ? `${item.infirmier.user.nom} ${item.infirmier.user.prenom || ''}` : 'Non affecté'}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="p-4 pr-6">
                      <button 
                        onClick={() => setSelectedIntervention(item)}
                        className="bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye size={14} />
                        <span>Détails & Actions</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
