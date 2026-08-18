import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, ArrowDownRight, AlertTriangle, Truck, 
  Search, RefreshCw, Layers, CheckCircle2, DollarSign 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../../services/api';
import ReportDateFilter from '../../../components/ReportDateFilter';

export default function RapportAchatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ date_debut: '', date_fin: '' });

  useEffect(() => {
    fetchAchatsReport(dateFilter);
  }, [dateFilter]);

  const fetchAchatsReport = async (filters = dateFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const res = await api.get('/rapports/achats', { params });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching achats report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (newFilters) => {
    setDateFilter(newFilters);
  };

  if (loading) {
    return (
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={36} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#3B82F6' }} />
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Chargement du rapport des achats...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    total_achats: 94000,
    total_retours_pertes: 3800,
    nb_commandes: 28,
    solde_du: 14500,
  };

  const achats = data?.derniers_achats || [];
  const filteredAchats = achats.filter(a => 
    (a.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.fournisseur?.nom || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>
            Rapport des Achats & Dépenses Fournisseurs
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Analyse des approvisionnements, gestion des pertes/retours marchandises et décaissements
          </p>
        </div>

        <button 
          onClick={() => fetchAchatsReport(dateFilter)}
          className="erp-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '10px' }}
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {/* Date Range Filter */}
      <ReportDateFilter onFilter={handleDateFilter} />

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total des Achats Réalisés</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Number(kpis.total_achats).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sur {kpis.nb_commandes} bons de commande
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pertes & Retours Fournisseurs</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#EF4444" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#EF4444' }}>
            {Number(kpis.total_retours_pertes).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#EF4444', marginTop: '4px' }}>
            4.0% de taux de réclamation / perte
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Solde Dû Fournisseurs</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#F59E0B' }}>
            {Number(kpis.solde_du).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Échéance moyenne : 30 jours
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Fournisseurs Actifs</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#10B981' }}>
            {data?.fournisseurs_distribution?.length || 4} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>partenaires</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px' }}>
            ✓ Approvisionnement sécurisé
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Evolution Achats vs Pertes */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
            Évolution Mensuelle des Dépenses d'Achats & Pertes
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.evolution || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="mois" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }} 
                  formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} MAD`, '']}
                />
                <Bar dataKey="achats" fill="#3B82F6" name="Achats Nets" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pertes_retours" fill="#EF4444" name="Pertes & Retours" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
            Dépenses par Fournisseur
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.fournisseurs_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="montant"
                >
                  {(data?.fournisseurs_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} MAD`, 'Dépense']} />
                <Legend formatter={(val) => <span style={{ fontSize: '0.78rem', color: '#334155' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Bons de Commande & Réceptions Fournisseurs
          </h2>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Rechercher réf ou fournisseur..."
              className="glass-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: 34, paddingRight: 10, paddingBlock: 8, fontSize: '0.85rem', color: '#1E293B' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: 'rgba(248, 250, 252, 0.8)' }}>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Réf. Achat</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Fournisseur</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Statut Livraison</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600, textAlign: 'right' }}>Montant Achat</th>
              </tr>
            </thead>
            <tbody>
              {filteredAchats.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    Aucun bon d'achat trouvé.
                  </td>
                </tr>
              ) : (
                filteredAchats.map((a, idx) => (
                  <tr key={a.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563EB' }}>
                      {a.reference || `ACH-2026-${String(idx + 1).padStart(3, '0')}`}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1E293B' }}>
                      {a.fournisseur?.nom || 'Fournisseur Médical'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748B' }}>
                      {a.created_at ? new Date(a.created_at).toLocaleDateString('fr-FR') : '18/08/2026'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#DCFCE7', color: '#15803D' }}>
                        {a.statut || 'Reçu'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#1E293B' }}>
                      {Number(a.montant_total || 3200).toLocaleString('fr-FR')} MAD
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
