/**
 * RapportStock — page de rapport de stock (valeurs, alertes, ruptures, par catégorie).
 * Route : /gestionnaire/rapports/stock
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Package, AlertTriangle, XCircle, TrendingDown, RefreshCw, Download,
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];

export default function RapportStock() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/rapports/stock');
            setData(res.data?.data);
        } catch (err) {
            console.error('Erreur rapport stock:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Chargement...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Aucune donnée disponible.</div>;

    const synthese = data.synthese ?? {};
    const alertes = data.alertes ?? [];
    const ruptures = data.ruptures ?? [];
    const parCategorie = data.par_categorie ?? [];

    return (
        <div className="erp-page" style={{ padding: '24px 32px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={24} color="#2563EB" />
                        Rapport de Stock
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>État du stock, alertes et ruptures.</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={load} style={btnSecondary}><RefreshCw size={14} /> Actualiser</button>
                    <button onClick={() => window.print()} style={btnSecondary}><Download size={14} /> Exporter</button>
                </div>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <KpiCard label="Produits gérés" value={synthese.total_produits ?? 0} icon={Package} color="#2563EB" />
                <KpiCard label="En alerte" value={synthese.produits_alerte ?? 0} icon={AlertTriangle} color="#F59E0B" />
                <KpiCard label="En rupture" value={synthese.produits_rupture ?? 0} icon={XCircle} color="#EF4444" />
                <KpiCard label="Valeur totale" value={`${Number(synthese.valeur_stock ?? 0).toLocaleString('fr-FR')} MAD`} icon={TrendingDown} color="#10B981" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Répartition par catégorie */}
                <Card title="Répartition par catégorie">
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={parCategorie} dataKey="count" nameKey="categorie" cx="50%" cy="50%" outerRadius={90} label>
                                    {parCategorie.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Valeur par catégorie */}
                <Card title="Valeur du stock par catégorie (MAD)">
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={parCategorie} margin={{ top: 10, right: 10, bottom: 30, left: 0 }}>
                                <XAxis dataKey="categorie" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip formatter={v => Number(v).toLocaleString('fr-FR') + ' MAD'} />
                                <Bar dataKey="valeur" fill="#2563EB" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Alertes et ruptures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <Card title={`Alertes de stock (${alertes.length})`}>
                    {alertes.length === 0 ? (
                        <Empty text="Aucune alerte. Stocks suffisants." />
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                    <th style={th}>Produit</th>
                                    <th style={th}>Stock</th>
                                    <th style={th}>Seuil</th>
                                    <th style={th}>Taux</th>
                                </tr>
                            </thead>
                            <tbody>
                                {alertes.map((a, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={td}>{a.nom}</td>
                                        <td style={{ ...td, color: '#F59E0B', fontWeight: 600 }}>{a.stock}</td>
                                        <td style={td}>{a.seuil}</td>
                                        <td style={td}>{a.taux}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>

                <Card title={`Ruptures de stock (${ruptures.length})`}>
                    {ruptures.length === 0 ? (
                        <Empty text="Aucune rupture. Tout est en stock." color="#10B981" />
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
                                    <th style={th}>Produit</th>
                                    <th style={th}>Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ruptures.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ ...td, color: '#EF4444', fontWeight: 600 }}>{r.nom}</td>
                                        <td style={td}>{r.code}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}

const th = { textAlign: 'left', padding: '8px 12px', fontWeight: 600, color: '#475569', fontSize: '11px', textTransform: 'uppercase' };
const td = { padding: '10px 12px', color: '#1E293B' };
const btnSecondary = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#1E293B',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
};

function Card({ title, children }) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '20px',
        }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>{title}</h3>
            {children}
        </div>
    );
}

function KpiCard({ label, value, icon: Icon, color }) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
                <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>{value}</div>
        </div>
    );
}

function Empty({ text, color = '#94A3B8' }) {
    return (
        <div style={{ textAlign: 'center', padding: '32px', color }}>
            <div style={{ fontSize: '13px' }}>{text}</div>
        </div>
    );
}
