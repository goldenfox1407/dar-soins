/**
 * AI Reports — Page principale de la rubrique "Rapports & IA" du gestionnaire.
 *
 * Affiche :
 *  - Synthèse globale générée par IA (texte)
 *  - Anomalies détectées (cartes par sévérité)
 *  - Prévisions 30 jours (KPIs + tendances)
 *  - Recommandations stratégiques (liste d'actions)
 *
 * Route : /gestionnaire/ai-reports
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    Brain, AlertTriangle, TrendingUp, Lightbulb, RefreshCw,
    Sparkles, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import api from '../../services/api';

export default function AiReports() {
    const [activeTab, setActiveTab] = useState('synthese');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({ synthese: null, anomalies: null, previsions: null, recommandations: null });

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [syn, ano, prev, reco] = await Promise.allSettled([
                api.get('/rapports/ia/synthese'),
                api.get('/rapports/ia/anomalies'),
                api.get('/rapports/ia/previsions'),
                api.get('/rapports/ia/recommandations'),
            ]);

            setData({
                synthese: syn.status === 'fulfilled' ? syn.value.data?.data : null,
                anomalies: ano.status === 'fulfilled' ? ano.value.data?.data : null,
                previsions: prev.status === 'fulfilled' ? prev.value.data?.data : null,
                recommandations: reco.status === 'fulfilled' ? reco.value.data?.data : null,
            });
        } catch (err) {
            console.error('Erreur chargement rapports IA:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    return (
        <div className="erp-page" style={{ background: '#F8FAFC', minHeight: '100vh', padding: '24px 32px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                            background: 'linear-gradient(135deg, #8B5CF6, #2563EB)',
                            color: '#FFFFFF',
                            padding: '8px 12px',
                            borderRadius: '10px',
                        }}>
                            <Brain size={22} />
                        </span>
                        Rapports & Intelligence Artificielle
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                        Analyses prédictives, détection d'anomalies et recommandations stratégiques.
                    </p>
                </div>
                <button onClick={loadAll} disabled={loading} style={{
                    background: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    cursor: loading ? 'wait' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                }}>
                    <RefreshCw size={16} className={loading ? 'spin' : ''} />
                    {loading ? 'Analyse en cours...' : 'Rafraîchir l\'analyse'}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', borderBottom: '2px solid #E2E8F0' }}>
                <TabButton active={activeTab === 'synthese'} onClick={() => setActiveTab('synthese')} icon={Sparkles} label="Synthèse" />
                <TabButton active={activeTab === 'anomalies'} onClick={() => setActiveTab('anomalies')} icon={AlertTriangle} label={`Anomalies${data.anomalies?.total ? ` (${data.anomalies.total})` : ''}`} />
                <TabButton active={activeTab === 'previsions'} onClick={() => setActiveTab('previsions')} icon={TrendingUp} label="Prévisions" />
                <TabButton active={activeTab === 'recommandations'} onClick={() => setActiveTab('recommandations')} icon={Lightbulb} label={`Recommandations${data.recommandations?.total ? ` (${data.recommandations.total})` : ''}`} />
            </div>

            {/* Content */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                    <Brain size={48} style={{ marginBottom: '16px', opacity: 0.4 }} />
                    <div style={{ fontSize: '14px' }}>Analyse IA en cours...</div>
                </div>
            )}

            {!loading && activeTab === 'synthese' && <SyntheseTab data={data.synthese} />}
            {!loading && activeTab === 'anomalies' && <AnomaliesTab data={data.anomalies} />}
            {!loading && activeTab === 'previsions' && <PrevisionsTab data={data.previsions} />}
            {!loading && activeTab === 'recommandations' && <RecommandationsTab data={data.recommandations} />}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: 'none',
                border: 'none',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: active ? 600 : 500,
                color: active ? '#2563EB' : '#64748B',
                borderBottom: active ? '2px solid #2563EB' : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
            }}
        >
            <Icon size={15} />
            {label}
        </button>
    );
}

function SyntheseTab({ data }) {
    if (!data) return <EmptyState />;
    const kpis = data.donnees?.kpis ?? data.kpis ?? {};

    return (
        <div>
            <div style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                border: '1px solid #BFDBFE',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '20px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1E40AF' }}>
                    <Sparkles size={18} />
                    <strong style={{ fontSize: '15px' }}>Analyse IA</strong>
                    <span style={{ fontSize: '11px', color: '#64748B', marginLeft: 'auto' }}>
                        Généré le {new Date(data.genere_le).toLocaleString('fr-FR')}
                    </span>
                </div>
                <div style={{
                    background: '#FFFFFF',
                    padding: '20px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: 1.7,
                    color: '#1E293B',
                    whiteSpace: 'pre-wrap',
                }}>
                    {data.analyse || 'Analyse non disponible.'}
                </div>
            </div>

            {/* KPIs principaux */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <KpiCard label="Interventions (mois)" value={kpis.interventions?.mois_courant ?? 0} variation={kpis.interventions?.variation} />
                <KpiCard label="Revenus (mois)" value={`${Number(kpis.revenus?.mois_courant ?? 0).toLocaleString('fr-FR')} MAD`} variation={kpis.revenus?.variation} />
                <KpiCard label="Nouveaux clients" value={kpis.clients?.mois_courant ?? 0} sublabel={`Total : ${kpis.clients?.total ?? 0}`} />
                <KpiCard label="Infirmiers dispo." value={kpis.infirmiers?.disponibles ?? 0} sublabel={`Total : ${kpis.infirmiers?.total ?? 0}`} />
            </div>
        </div>
    );
}

function AnomaliesTab({ data }) {
    if (!data) return <EmptyState />;
    const anomalies = data.anomalies ?? [];

    const parSeverite = {
        haute: anomalies.filter(a => a.severite === 'haute'),
        moyenne: anomalies.filter(a => a.severite === 'moyenne'),
        basse: anomalies.filter(a => a.severite === 'basse'),
    };

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                <StatCard label="Critiques" count={parSeverite.haute.length} color="#EF4444" icon={AlertCircle} />
                <StatCard label="Moyennes" count={parSeverite.moyenne.length} color="#F59E0B" icon={AlertTriangle} />
                <StatCard label="Mineures" count={parSeverite.basse.length} color="#10B981" icon={CheckCircle} />
            </div>

            {anomalies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#10B981' }}>
                    <CheckCircle size={48} style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Aucune anomalie détectée</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>Tous les indicateurs sont dans les normes.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {anomalies.map((a, i) => (
                        <AnomalieCard key={i} anomaly={a} />
                    ))}
                </div>
            )}
        </div>
    );
}

function PrevisionsTab({ data }) {
    if (!data) return <EmptyState />;
    const prev = data.previsions ?? {};
    const tend = data.tendances ?? {};

    return (
        <div>
            <div style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1px solid #BBF7D0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
            }}>
                <TrendingUp size={24} color="#16A34A" />
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#14532D' }}>
                        Prévision sur {data.horizon ?? '30 jours'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#16A34A' }}>
                        Niveau de confiance : <strong>{(data.confiance ?? 'moyenne').toUpperCase()}</strong>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <KpiCard label="Revenus estimés (30j)" value={`${Number(prev.revenus_estime ?? 0).toLocaleString('fr-FR')} MAD`} />
                <KpiCard label="Interventions estimées" value={Math.round(prev.interventions_estimees ?? 0)} />
                <KpiCard label="Taux d'occupation infirmiers" value={`${prev.taux_occupation_infimiers ?? 0}%`} />
            </div>

            <div style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
            }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B', marginBottom: '16px' }}>
                    Tendance des revenus (3 derniers mois)
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    {tend.revenus?.direction === 'hausse' && <ArrowUpRight size={20} color="#10B981" />}
                    {tend.revenus?.direction === 'baisse' && <ArrowDownRight size={20} color="#EF4444" />}
                    {tend.revenus?.direction === 'stable' && <span style={{ fontSize: '14px', color: '#64748B' }}>→</span>}
                    <span style={{
                        fontSize: '16px',
                        fontWeight: 700,
                        color: tend.revenus?.direction === 'hausse' ? '#10B981' : tend.revenus?.direction === 'baisse' ? '#EF4444' : '#64748B',
                    }}>
                        {tend.revenus?.pente > 0 ? '+' : ''}{tend.revenus?.pente ?? 0}%
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B', textTransform: 'capitalize' }}>
                        {tend.revenus?.direction}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748B' }}>
                    <div>M-2: <strong>{Number(tend.details?.mois_m2 ?? 0).toLocaleString('fr-FR')} MAD</strong></div>
                    <div>M-1: <strong>{Number(tend.details?.mois_m1 ?? 0).toLocaleString('fr-FR')} MAD</strong></div>
                    <div>M: <strong>{Number(tend.details?.mois_m0 ?? 0).toLocaleString('fr-FR')} MAD</strong></div>
                </div>
            </div>
        </div>
    );
}

function RecommandationsTab({ data }) {
    if (!data) return <EmptyState />;
    const recos = data.recommandations ?? [];

    if (recos.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                <Lightbulb size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                <div style={{ fontSize: '14px' }}>Aucune recommandation pour le moment.</div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recos.map((r, i) => (
                <div key={i} style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderLeft: `4px solid ${r.priorite === 'haute' ? '#EF4444' : r.priorite === 'moyenne' ? '#F59E0B' : '#10B981'}`,
                    borderRadius: '8px',
                    padding: '16px 20px',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                            {r.titre}
                        </div>
                        <span style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: r.priorite === 'haute' ? '#FEE2E2' : r.priorite === 'moyenne' ? '#FEF3C7' : '#D1FAE5',
                            color: r.priorite === 'haute' ? '#DC2626' : r.priorite === 'moyenne' ? '#D97706' : '#059669',
                        }}>
                            {r.priorite}
                        </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                        {r.description}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                        <div>
                            <span style={{ color: '#94A3B8' }}>Action : </span>
                            <span style={{ color: '#1E293B', fontWeight: 500 }}>{r.action}</span>
                        </div>
                        {r.impact_estime && (
                            <div>
                                <span style={{ color: '#94A3B8' }}>Impact : </span>
                                <span style={{ color: '#1E293B', fontWeight: 500 }}>{r.impact_estime}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function KpiCard({ label, value, variation, sublabel }) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
        }}>
            <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
                {label}
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                {value}
            </div>
            {variation !== undefined && (
                <div style={{
                    fontSize: '11px',
                    color: variation > 0 ? '#10B981' : variation < 0 ? '#EF4444' : '#64748B',
                    fontWeight: 600,
                }}>
                    {variation > 0 ? '↑' : variation < 0 ? '↓' : '→'} {Math.abs(variation)}% vs mois prec.
                </div>
            )}
            {sublabel && <div style={{ fontSize: '11px', color: '#94A3B8' }}>{sublabel}</div>}
        </div>
    );
}

function StatCard({ label, count, color, icon: Icon }) {
    return (
        <div style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
            textAlign: 'center',
        }}>
            <Icon size={20} color={color} style={{ marginBottom: '6px' }} />
            <div style={{ fontSize: '24px', fontWeight: 700, color }}>{count}</div>
            <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
        </div>
    );
}

function AnomalieCard({ anomaly }) {
    const colors = {
        haute: { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' },
        moyenne: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
        basse: { bg: '#D1FAE5', border: '#10B981', text: '#065F46' },
    };
    const c = colors[anomaly.severite] || colors.moyenne;

    return (
        <div style={{
            background: '#FFFFFF',
            border: `1px solid ${c.border}30`,
            borderLeft: `4px solid ${c.border}`,
            borderRadius: '8px',
            padding: '16px 20px',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>{anomaly.titre}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 600 }}>{anomaly.type}</div>
                </div>
                <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    background: c.bg,
                    color: c.text,
                }}>
                    {anomaly.severite}
                </span>
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                {anomaly.description}
            </div>
            <div style={{ fontSize: '12px', color: '#1E293B', background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px' }}>
                💡 {anomaly.recommandation}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
            <Brain size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
            <div style={{ fontSize: '14px' }}>Données non disponibles.</div>
        </div>
    );
}
