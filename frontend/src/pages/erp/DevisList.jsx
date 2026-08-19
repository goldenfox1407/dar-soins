import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Search, Filter, RefreshCw, Calendar, User, CheckCircle2, Clock } from 'lucide-react';
import api from '../../services/api';
import { openOrDownloadPdf } from '../../utils/pdfViewer';
import { formatMoney, formatDateTime } from '../../utils/formatters';
import StatusBadge from '../../components/common/StatusBadge';

export default function DevisList() {
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchDevis();
  }, []);

  const fetchDevis = async () => {
    setLoading(true);
    try {
      const res = await api.get('/devis');
      const items = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setDevisList(items);
    } catch (err) {
      console.error('Erreur lors du chargement des devis:', err);
      setDevisList([]);
    } finally {
      setLoading(false);
    }
  };

  const telechargerPdf = (id) => {
    openOrDownloadPdf(`/devis/${id}/pdf`, `devis_${id}.pdf`);
  };

  const filteredDevis = devisList.filter(item => {
    const clientName = item.intervention?.client?.user?.name || '';
    const produitName = item.intervention?.produit?.nom || '';
    const devisRef = `DEV-${String(item.id).padStart(5, '0')}`;
    
    const matchesSearch = clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          produitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          devisRef.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.statut === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalMontantEstime = devisList.reduce((acc, curr) => acc + (parseFloat(curr.montant_estime || curr.montant_total || 0)), 0);

  return (
    <div className="space-y-6">
      {/* ── EN-TÊTE ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Gestion des Devis</h1>
            <p className="text-sm text-slate-500">Consultez, filtrez et téléchargez l'ensemble des devis clients émis.</p>
          </div>
        </div>
        <button
          onClick={fetchDevis}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-all duration-200 text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Devis Émis</div>
            <div className="text-2xl font-bold text-slate-800">{devisList.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Montant Estimé Total</div>
            <div className="text-2xl font-bold text-emerald-600">{formatMoney(totalMontantEstime)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dernier Devis Émis</div>
            <div className="text-sm font-bold text-slate-700">
              {devisList.length > 0 ? formatDateTime(devisList[0].created_at) : 'Aucun'}
            </div>
          </div>
        </div>
      </div>

      {/* ── FILTRES & RECHERCHE ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par client, soin, référence..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value="brouillon">Brouillon</option>
            <option value="envoye">Envoyé</option>
            <option value="accepte">Accepté</option>
            <option value="refuse">Refusé</option>
          </select>
        </div>
      </div>

      {/* ── TABLEAU DES DEVIS ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm font-medium">Chargement des devis en cours...</p>
          </div>
        ) : filteredDevis.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <div className="p-4 bg-slate-100 rounded-full mb-3 text-slate-400">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-700 mb-1">Aucun devis trouvé</h3>
            <p className="text-sm text-slate-400 max-w-sm">
              {searchTerm || statusFilter !== 'all' 
                ? 'Aucun devis ne correspond à vos critères de recherche.' 
                : 'Les devis générés lors des demandes d\'interventions apparaîtront ici.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Réf. Devis</th>
                  <th className="px-6 py-4">Date d'émission</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Prestation Demandée</th>
                  <th className="px-6 py-4 text-right">Montant Estimé</th>
                  <th className="px-6 py-4 text-center">Statut</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredDevis.map((item) => {
                  const montant = item.montant_estime || item.montant_total || item.intervention?.produit?.prix_client || 0;
                  const clientName = item.intervention?.client?.user?.name || 'Patient inconnu';
                  const soinName = item.intervention?.produit?.nom || 'Soin infirmier';
                  const devisRef = `DEV-${String(item.id).padStart(5, '0')}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-blue-600">
                        {devisRef}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {formatDateTime(item.date || item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{clientName}</div>
                        {item.intervention?.client?.user?.telephone && (
                          <div className="text-xs text-slate-400">{item.intervention.client.user.telephone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{soinName}</div>
                        <div className="text-xs text-slate-400 capitalize">
                          {item.intervention?.type ? item.intervention.type.replace('_', ' ') : 'Soin à domicile'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">
                        {formatMoney(montant)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={item.statut || 'genere'} type="default" />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => telechargerPdf(item.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-lg transition-colors"
                          title="Télécharger le devis PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                          PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
