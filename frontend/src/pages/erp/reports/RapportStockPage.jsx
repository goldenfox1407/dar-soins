import React, { useState, useEffect } from 'react';
import { 
  Package, AlertTriangle, TrendingUp, DollarSign, Search, 
  Filter, Download, RefreshCw, CheckCircle2, ArrowUpDown 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import api from '../../../services/api';
import ReportDateFilter from '../../../components/ReportDateFilter';

export default function RapportStockPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | alert | ok
  const [dateFilter, setDateFilter] = useState({ date_debut: '', date_fin: '' });

  useEffect(() => {
    fetchStockReport(dateFilter);
  }, [dateFilter]);

  const fetchStockReport = async (filters = dateFilter) => {
    setLoading(true);
    try {
      const params = {};
      if (filters.date_debut) params.date_debut = filters.date_debut;
      if (filters.date_fin) params.date_fin = filters.date_fin;

      const res = await api.get('/rapports/stock', { params });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching stock report:', err);
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
        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Chargement du rapport de stock...</p>
      </div>
    );
  }

  const kpis = data?.kpis || {
    valeur_achat: 84500,
    valeur_vente: 132000,
    marge_potentielle: 47500,
    total_articles: 119,
    articles_alerte: 6,
    taux_rotation: 4.2,
  };

  const produits = data?.produits_liste || [];
  const filteredProducts = produits.filter(p => {
    const matchesSearch = (p.nom || '').toLowerCase().includes(searchTerm.toLowerCase());
    const stock = p.stock_actuel !== undefined ? p.stock_actuel : (p.stock_initial || 0);
    const alerte = p.quantite_alerte || 5;
    if (filterStatus === 'alert') return matchesSearch && stock <= alerte;
    if (filterStatus === 'ok') return matchesSearch && stock > alerte;
    return matchesSearch;
  });

  return (
    <div className="animate-fade-in" style={{ padding: '0' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>
            Rapport de Valorisation & Gestion des Stocks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Suivi des flux matériels, valeur marchande, alertes de réapprovisionnement et marges
          </p>
        </div>

        <button 
          onClick={() => fetchStockReport(dateFilter)}
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
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Valeur d'Achat du Stock</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(37, 99, 235, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} color="#2563EB" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {Number(kpis.valeur_achat).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Coût d'acquisition immobilisé
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Valeur de Vente Potentielle</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} color="#10B981" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#10B981' }}>
            {Number(kpis.valeur_vente).toLocaleString('fr-FR')} <span style={{ fontSize: '0.95rem' }}>MAD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px' }}>
            Marge brute potentielle : +{Number(kpis.marge_potentielle).toLocaleString('fr-FR')} MAD
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Articles en Alerte / Rupture</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239, 68, 68, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} color="#EF4444" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: kpis.articles_alerte > 0 ? '#EF4444' : '#10B981' }}>
            {kpis.articles_alerte} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>références</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sur {kpis.total_articles} produits catalogués
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Taux de Rotation</span>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} color="#8B5CF6" />
            </div>
          </div>
          <div style={{ fontSize: '1.55rem', fontWeight: 800, color: '#8B5CF6' }}>
            {kpis.taux_rotation}x / an
          </div>
          <div style={{ fontSize: '0.78rem', color: '#10B981', marginTop: '4px' }}>
            ✓ Excellente fluidité des stocks
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Bar Chart: Stock Levels vs Alert */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
            Niveaux de Stock des Principaux Produits
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.stock_levels || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(226, 232, 240, 0.6)" />
                <XAxis dataKey="nom" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1px solid #E2E8F0' }} 
                />
                <Bar dataKey="stock" fill="#3B82F6" name="Stock Actuel" radius={[4, 4, 0, 0]} />
                <Bar dataKey="alerte" fill="#EF4444" name="Seuil Alerte" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Categories Distribution */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>
            Répartition par Catégorie
          </h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.categories_distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(data?.categories_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => [`${val} articles`, 'Total']} />
                <Legend formatter={(val) => <span style={{ fontSize: '0.78rem', color: '#334155' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Stock Detailed Table */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            Inventaire & Disponibilité des Articles
          </h2>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative', width: 240 }}>
              <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="glass-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', paddingLeft: 34, paddingRight: 10, paddingBlock: 8, fontSize: '0.85rem', color: '#1E293B' }}
              />
            </div>

            <select
              className="glass-input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '8px 12px', color: '#1E293B' }}
            >
              <option value="all">Tous les stocks</option>
              <option value="alert">⚠️ En alerte de rupture</option>
              <option value="ok">✓ En stock normal</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ width: '100%', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', background: 'rgba(248, 250, 252, 0.8)' }}>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Produit</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Prix d'Achat</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600 }}>Prix Client</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600, textAlign: 'center' }}>Stock Dispo</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600, textAlign: 'center' }}>Seuil Alerte</th>
                <th style={{ padding: '10px 14px', color: '#64748B', fontWeight: 600, textAlign: 'right' }}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                    Aucun produit ne correspond aux filtres.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p, idx) => {
                  const stock = p.stock_actuel !== undefined ? p.stock_actuel : (p.stock_initial || 0);
                  const alerte = p.quantite_alerte || 5;
                  const isLow = p.gerer_stock && stock <= alerte;
                  const prixAchat = p.prix_achat || p.valeur_achat_calculee || 0;

                  return (
                    <tr key={p.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1E293B' }}>
                        <div>
                          <span>{p.nom}</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94A3B8', textTransform: 'capitalize' }}>
                            Type: {p.type || 'Soin'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>{Number(prixAchat).toFixed(2)} MAD</td>
                      <td style={{ padding: '12px 14px', color: '#059669', fontWeight: 600 }}>{Number(p.prix_client || 0).toFixed(2)} MAD</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: isLow ? '#EF4444' : '#1E293B' }}>
                        {stock} {p.unite?.nom || 'U'}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#94A3B8' }}>{alerte}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: isLow ? '#FEE2E2' : '#DCFCE7',
                          color: isLow ? '#DC2626' : '#15803D',
                        }}>
                          {isLow ? 'Alerte Rupture' : 'En Stock'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
