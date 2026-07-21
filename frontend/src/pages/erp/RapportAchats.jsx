/**
 * RapportAchats — page de rapport des achats (évolution, statuts, top fournisseurs).
 * Route : /gestionnaire/rapports/achats
 */
import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingCart, RefreshCw, Download } from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import api from '../../services/api';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function RapportAchats() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [periode, setPeriode] = useState({ from: '', to: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (periode.from) params.set('from', periode.from);
            if (periode.to) params.set('to', periode.to);
            const res = await api.get(`/rapports/achats?${params.toString()}`);
            setData(res.data?.data);
        } catch (err) {
            console.error('Erreur rapport achats:', err);
        } finally {
            setLoading(false);
        }
    }, [periode]);

    useEffect(() => { load(); }, [load]);

    if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Chargement...</div>;
    if (!data) return <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>Aucune donnée.</div>;

    const synthese = data.synthese ?? {};
    const evolution = data.evolution ?? [];
    const parStatut = data.par_statut ?? [];
    const topFournisseurs = data.top_fournisseurs ?? [];

    return (
        <div className="erp-page" style={{ padding: '24px 32px', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <ShoppingCart size={24} color="#F59E0B" />
                        Rapport des Achats
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>Période : {data.periode?.debut} → {data.periode?.fin}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="date" value={periode.from} onChange={(e) => setPeriode(p => ({ ...p, from: e.target.value }))} style={inputStyle} />
                    <input type="date" value={periode.to} onChange={(e) => setPeriode(p => ({ ...p, to: e.target.value }))} style={inputStyle} />
                    <button onClick={load} style={btnSecondary}><RefreshCw size={14} /></button>
                    <button onClick={() => window.print()} style={btnSecondary}><Download size={14} /></button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <KpiCard label="Total achats" value={synthese.total_achats ?? 0} color="#F59E0B" />
                <KpiCard label="Montant total" value={`${Number(synthese.montant_total ?? 0).toLocaleString('fr-FR')} MAD`} color="#EF4444" />
                <KpiCard label="Panier moyen" value={`${Number(synthese.panier_moyen ?? 0).toLocaleString('fr-FR')} MAD`} color="#2563EB" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Évolution des achats</h3>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={evolution}>
                                <defs>
                                    <linearGradient id="achatsGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip formatter={v => Number(v).toLocaleString('fr-FR') + ' MAD'} />
                                <Area type="monotone" dataKey="total" stroke="#F59E0B" strokeWidth={2} fill="url(#achatsGrad)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '20px',
                }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Par statut</h3>
                    <div style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={parStatut} dataKey="count" nameKey="statut" cx="50%" cy="50%" outerRadius={80} label>
                                    {parStatut.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>Top 10 fournisseurs</h3>
                <div style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topFournisseurs} layout="vertical" margin={{ left: 100, right: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="nom" tick={{ fontSize: 10 }} width={150} />
                            <Tooltip formatter={v => Number(v).toLocaleString('fr-FR') + ' MAD'} />
                            <Bar dataKey="total" name="Montant" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

const inputStyle = {
    padding: '6px 10px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '12px',
    background: '#FFFFFF',
};

const btnSecondary = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#1E293B',
    padding: '8px 12px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
};

function KpiCard({ label, value, color }) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderLeft: `4px solid ${color}`,
            borderRadius: '10px',
            padding: '16px',
        }}>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>{label}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>{value}</div>
        </div>
    );
}
