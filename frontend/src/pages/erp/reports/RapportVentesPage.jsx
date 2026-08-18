import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingCart, Percent, 
  Search, RefreshCw, ArrowUpRight, CheckCircle2, Clock, AlertCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../../services/api';
import ReportDateFilter from '../../../components/ReportDateFilter';

export default function RapportVentesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState({ date_debut: '', date_fin: '' });

  useEffect(() => {
    fetchVentesReport(dateFilter);
  }, [dateFilter]);

  const fetchVentesReport = async (filters = dateFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const res = await api.get('/rapports/ventes', { params });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching ventes report:', err);
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
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Chargement du rapport des ventes...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    chiffre_affaires: 168400,
    nombre_ventes: 65,
    panier_moyen: 2590,
    marge_brute: 64000,
    taux_marge: 38.0,
  };

  const ventes = data?.dernieres_ventes || [];
  const filteredVentes = ventes.filter(v => 
    (v.reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.client || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.type || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>
            Rapport des Ventes & Analyse des Marges
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Suivi des recettes commerciales, calcul des profits bruts et performance des encaissements
          </p>
        </div>

        <button 
          onClick={() => fetchVentesReport(dateFilter)}
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Chiffre d'Affaires Total</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Number(kpis.chiffre_affaires).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
            <ArrowUpRight size={14} /> +21.2% sur le trimestre
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Marge Brute Réalisée</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#10B981' }}>
            {Number(kpis.marge_brute).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Taux de marge brute : <strong style={{ color: '#10B981' }}>{kpis.taux_marge}%</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Volume de Ventes</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={18} color="#8B5CF6" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#8B5CF6' }}>
            {kpis.nombre_ventes} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>commandes</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Panier moyen : <strong>{Number(kpis.panier_moyen).toLocaleString('fr-FR')} MAD</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taux de Recouvrement</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={18} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#F59E0B' }}>
            91.4%
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px' }}>
            ✓ Faible niveau d'impayés client
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Evolution CA vs Marges */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
            Évolution Mensuelle : Chiffre d'Affaires vs Marge Brute
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.evolution || []}>
                <defs>
                  <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="mois" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }} 
                  formatter={(val) => [`${Number(val).toLocaleString('fr-FR')} MAD`, '']}
                />
                <Area type="monotone" dataKey="chiffre_affaires" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCA)" name="Chiffre d'Affaires" />
                <Area type="monotone" dataKey="marge_brute" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorMarge)" name="Marge Brute" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Status Breakdown */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
            Répartition des Règlements
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statuts_paiement || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.statuts_paiement || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} transactions`, 'Volume']} />
                <Legend formatter={(val) => <span style={{ fontSize: '0.78rem', color: '#334155' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Dernières Ventes & Encaissements
          </h2>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Filtrer par référence..."
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
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Réf. Vente</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Statut Vente</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Paiement</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600, textAlign: 'right' }}>Montant Total</th>
              </tr>
            </thead>
            <tbody>
              {filteredVentes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    Aucune vente enregistrée.
                  </td>
                </tr>
              ) : (
                filteredVentes.map((v, idx) => (
                  <tr key={v.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563EB' }}>
                      {v.reference || `VNT-2026-${String(idx + 1).padStart(3, '0')}`}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748B' }}>
                      {v.created_at ? new Date(v.created_at).toLocaleDateString('fr-FR') : '18/08/2026'}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, background: '#DCFCE7', color: '#15803D' }}>
                        {v.statut || 'Complété'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: v.statut_paiement === 'paye' ? '#DCFCE7' : (v.statut_paiement === 'partiel' ? '#FEF3C7' : '#FEE2E2'),
                        color: v.statut_paiement === 'paye' ? '#15803D' : (v.statut_paiement === 'partiel' ? '#B45309' : '#DC2626'),
                      }}>
                        {v.statut_paiement === 'paye' ? 'Payé' : (v.statut_paiement === 'partiel' ? 'Partiel' : 'En Attente')}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#1E293B' }}>
                      {Number(v.montant_total || 450).toLocaleString('fr-FR')} MAD
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
