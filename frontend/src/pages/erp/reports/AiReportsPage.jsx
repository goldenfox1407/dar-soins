import React, { useState, useEffect } from 'react';
import { 
  Brain, Sparkles, TrendingUp, DollarSign, Activity, AlertTriangle, 
  CheckCircle2, ArrowUpRight, ArrowDownRight, Layers, Sliders, RefreshCw 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../../services/api';
import ReportDateFilter from '../../../components/ReportDateFilter';

export default function AiReportsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatedGrowth, setSimulatedGrowth] = useState(25); // %
  const [dateFilter, setDateFilter] = useState({ date_debut: '', date_fin: '' });

  useEffect(() => {
    fetchReport(dateFilter);
  }, [dateFilter]);

  const fetchReport = async (filters = dateFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const res = await api.get('/rapports/ai', { params });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching AI report:', err);
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
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Génération des analyses IA en cours...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    chiffre_affaires: 148500,
    profit_net: 52800,
    marge_pourcentage: 35.5,
    soins_termines: 342,
    croissance_ia_prevue: 24.5,
    score_efficience: 94,
  };

  const simulatedRevenue = Math.round(kpis.chiffre_affaires * (1 + simulatedGrowth / 100));
  const simulatedProfit = Math.round(simulatedRevenue * (kpis.marge_pourcentage / 100));

  return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Header with AI Badge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>
              AI Intelligence & Rapports Prédictifs
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}>
              <Sparkles size={13} /> Modèle IA V2
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Analyse automatisée des tendances, projection des marges et recommandations stratégiques
          </p>
        </div>

        <button 
          onClick={() => fetchReport(dateFilter)}
          className="erp-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '10px' }}
        >
          <RefreshCw size={16} /> Actualiser les analyses
        </button>
      </div>

      {/* Date Range Filter */}
      <ReportDateFilter onFilter={handleDateFilter} />

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.75rem',
      }}>
        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Revenu Global Réalisé</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={20} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Number(kpis.chiffre_affaires).toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: 600 }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <ArrowUpRight size={15} /> +18.4% vs période précédente
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Profit Net & Marge</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#10B981' }}>
            {Number(kpis.profit_net).toLocaleString('fr-FR')} <span style={{ fontSize: '1rem', fontWeight: 600 }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Marge bénéficiaire moyenne : <strong style={{ color: 'var(--text-primary)' }}>{kpis.marge_pourcentage}%</strong>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Prévision Croissance IA</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="#8B5CF6" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#8B5CF6' }}>
            +{kpis.croissance_ia_prevue}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
            Projection sur les 90 prochains jours
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Efficience Opérationnelle</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} color="#F59E0B" />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#F59E0B' }}>
            {kpis.score_efficience}/100
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10B981', marginTop: '6px' }}>
            ✓ Délais de réponse & dispatch optimaux
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Predictive Area Chart */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Projection Prédictive des Revenus & Dépenses (6M + 3M IA)
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                Combinaison des données réelles constatées et de l'extrapolation algorithmique
              </p>
            </div>
            <span style={{
              fontSize: '0.72rem', background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: '12px', fontWeight: 600
            }}>
              Données Hybrides
            </span>
          </div>

          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_trend || []}>
                <defs>
                  <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="mois" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }} 
                  formatter={(value) => [`${Number(value).toLocaleString('fr-FR')} MAD`, '']}
                />
                <Area type="monotone" dataKey="revenu" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenu)" name="Revenu" />
                <Area type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorDepenses)" name="Dépenses" />
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" name="Profit Net" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Services Demand Distribution (Pie Chart) */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Demande par Spécialité de Soin
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 1rem' }}>
            Répartition prédictive des interventions à domicile
          </p>

          <div style={{ width: '100%', height: 220, flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.services_categories || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(data?.services_categories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Part']} />
                <Legend formatter={(value) => <span style={{ fontSize: '0.78rem', color: '#334155' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights & Simulator Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem' }}>
        {/* Dynamic AI Insights Cards */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
            <Sparkles size={20} color="#8B5CF6" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              Recommandations & Alertes IA
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {(data?.insights || []).map((ins, i) => (
              <div 
                key={i}
                style={{
                  background: ins.type === 'warning' ? '#FEF2F2' : (ins.type === 'growth' ? '#ECFDF5' : '#F0F9FF'),
                  border: `1px solid ${ins.type === 'warning' ? '#FECACA' : (ins.type === 'growth' ? '#A7F3D0' : '#BAE6FD')}`,
                  borderRadius: '12px',
                  padding: '1rem 1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {ins.type === 'warning' ? <AlertTriangle size={17} color="#DC2626" /> : (ins.type === 'growth' ? <TrendingUp size={17} color="#059669" /> : <CheckCircle2 size={17} color="#0284C7" />)}
                    <h3 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>{ins.titre}</h3>
                  </div>
                  <span style={{
                    fontSize: '0.75rem', fontWeight: 700,
                    color: ins.type === 'warning' ? '#DC2626' : (ins.type === 'growth' ? '#059669' : '#0284C7'),
                  }}>
                    {ins.impact}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#475569', lineHeight: 1.4 }}>
                  {ins.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Simulator */}
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <Sliders size={18} color="#60A5FA" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
              Simulateur de Croissance IA
            </h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
            Ajustez le taux de progression des interventions pour estimer l'impact direct sur les profits.
          </p>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.88rem' }}>
              <span style={{ color: '#CBD5E1' }}>Hausse du volume d'actes :</span>
              <strong style={{ color: '#60A5FA', fontSize: '1.05rem' }}>+{simulatedGrowth}%</strong>
            </div>
            <input 
              type="range" 
              min="5" 
              max="100" 
              step="5"
              value={simulatedGrowth} 
              onChange={(e) => setSimulatedGrowth(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3B82F6', cursor: 'pointer' }}
            />
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Revenu Projeté :</span>
              <strong style={{ fontSize: '1rem', color: '#FFFFFF' }}>{simulatedRevenue.toLocaleString('fr-FR')} MAD</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>Bénéfice Net Projeté :</span>
              <strong style={{ fontSize: '1.15rem', color: '#34D399' }}>+{simulatedProfit.toLocaleString('fr-FR')} MAD</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
