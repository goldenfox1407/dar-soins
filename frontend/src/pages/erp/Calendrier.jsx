/**
 * Calendrier — vue hebdomadaire du planning (tâches + interventions par jour).
 * Route : /gestionnaire/calendrier
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';
import api from '../../services/api';

export default function Calendrier() {
    const [planning, setPlanning] = useState([]);
    const [semaine, setSemaine] = useState('');
    const [dateDebut, setDateDebut] = useState('');
    const [dateFin, setDateFin] = useState('');
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = semaine ? `?semaine=${semaine}` : '';
            const res = await api.get(`/planning${params}`);
            setPlanning(res.data?.planning ?? []);
            setDateDebut(res.data?.date_debut ?? '');
            setDateFin(res.data?.date_fin ?? '');
            setSemaine(res.data?.semaine ?? '');
        } catch (err) {
            console.error('Erreur planning:', err);
        } finally {
            setLoading(false);
        }
    }, [semaine]);

    useEffect(() => { load(); }, [load]);

    const changeWeek = (direction) => {
        if (!dateDebut) return;
        const d = new Date(dateDebut);
        d.setDate(d.getDate() + direction * 7);
        const annee = d.getFullYear();
        const debutSemaine = new Date(d);
        debutSemaine.setDate(d.getDate() - d.getDay() + 1);
        const numSemaine = Math.ceil((((debutSemaine - new Date(annee, 0, 1)) / 86400000) + 1) / 7);
        setSemaine(`${annee}-W${String(numSemaine).padStart(2, '0')}`);
    };

    const goToToday = () => setSemaine('');

    return (
        <div className="erp-page" style={{ padding: '24px 32px', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Calendar size={24} color="#2563EB" />
                        Calendrier — Planning hebdomadaire
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                        Semaine {semaine || 'courante'} — du {dateDebut} au {dateFin}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => changeWeek(-1)} style={btnIcon} title="Semaine précédente">
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={goToToday} style={btnSecondary}>Aujourd'hui</button>
                    <button onClick={() => changeWeek(1)} style={btnIcon} title="Semaine suivante">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Grille 7 jours */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '12px',
                minHeight: '600px',
            }}>
                {planning.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94A3B8' }}>
                        {loading ? 'Chargement du planning...' : 'Aucune donnée pour cette semaine.'}
                    </div>
                ) : (
                    planning.map((jour, idx) => (
                        <DayColumn key={idx} jour={jour} />
                    ))
                )}
            </div>
        </div>
    );
}

function DayColumn({ jour }) {
    const today = new Date().toDateString();
    const isToday = new Date(jour.date).toDateString() === today;

    const taches = jour.taches ?? [];
    const interventions = jour.interventions ?? [];

    return (
        <div style={{
            background: '#FFFFFF',
            border: `1px solid ${isToday ? '#2563EB' : '#E2E8F0'}`,
            borderRadius: '10px',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '500px',
        }}>
            {/* En-tête du jour */}
            <div style={{
                borderBottom: `2px solid ${isToday ? '#2563EB' : '#F1F5F9'}`,
                paddingBottom: '8px',
                marginBottom: '12px',
            }}>
                <div style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    textTransform: 'capitalize',
                    marginBottom: '2px',
                }}>
                    {jour.jour_semaine}
                </div>
                <div style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: isToday ? '#2563EB' : '#1E293B',
                }}>
                    {new Date(jour.date).toLocaleDateString('fr-FR', { day: '2-digit' })}
                </div>
                <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '2px' }}>
                    {taches.length + interventions.length} événement(s)
                </div>
            </div>

            {/* Événements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                {interventions.map((int, i) => (
                    <InterventionEvent key={`int-${i}`} intervention={int} />
                ))}
                {taches.map((t, i) => (
                    <TacheEvent key={`tache-${i}`} tache={t} />
                ))}
                {taches.length + interventions.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '20px 8px',
                        color: '#CBD5E1',
                        fontSize: '11px',
                        fontStyle: 'italic',
                    }}>
                        Rien à cette date
                    </div>
                )}
            </div>
        </div>
    );
}

function InterventionEvent({ intervention }) {
    return (
        <div style={{
            background: '#EFF6FF',
            borderLeft: '3px solid #2563EB',
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '11px',
        }}>
            <div style={{ fontWeight: 600, color: '#1E40AF', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={10} />
                {intervention.date_heure ? new Date(intervention.date_heure).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
            </div>
            <div style={{ color: '#475569', marginBottom: '2px' }}>
                {intervention.produit?.nom ?? 'Intervention'}
            </div>
            {intervention.client?.user && (
                <div style={{ color: '#64748B', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={9} />
                    {intervention.client.user.prenom} {intervention.client.user.nom}
                </div>
            )}
        </div>
    );
}

function TacheEvent({ tache }) {
    const priorites = {
        urgente: '#EF4444', haute: '#F59E0B', normale: '#2563EB', basse: '#64748B',
    };
    const color = priorites[tache.priorite] ?? '#2563EB';

    return (
        <div style={{
            background: `${color}10`,
            borderLeft: `3px solid ${color}`,
            borderRadius: '6px',
            padding: '6px 8px',
            fontSize: '11px',
        }}>
            <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '2px' }}>
                {tache.titre}
            </div>
            <div style={{ color: '#94A3B8', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={9} />
                {tache.assigne?.nom_complet ?? 'Non assigné'}
            </div>
        </div>
    );
}

const btnSecondary = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#1E293B',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
};

const btnIcon = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#1E293B',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};
