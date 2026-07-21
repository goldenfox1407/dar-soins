/**
 * TachesList — page Kanban / Liste des tâches d'organisation.
 * Route : /gestionnaire/taches
 *
 * Affichage en 5 colonnes (Kanban) : À faire / En cours / En revue / Terminées / Annulées.
 * Drag & drop simplifié via boutons "→" pour changer de statut.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckSquare, Plus, RefreshCw, Trash2, Edit3, X, AlertTriangle, Clock, User,
} from 'lucide-react';
import api from '../../services/api';

const STATUTS = [
    { key: 'a_faire',   label: 'À faire',    color: '#64748B', bg: '#F1F5F9' },
    { key: 'en_cours',  label: 'En cours',   color: '#2563EB', bg: '#EFF6FF' },
    { key: 'en_revue',  label: 'En revue',    color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'terminee',  label: 'Terminée',   color: '#10B981', bg: '#F0FDF4' },
    { key: 'annulee',   label: 'Annulée',    color: '#EF4444', bg: '#FEF2F2' },
];

const PRIORITES = {
    urgente: { label: 'Urgente', color: '#EF4444' },
    haute:   { label: 'Haute',   color: '#F59E0B' },
    normale: { label: 'Normale', color: '#2563EB' },
    basse:   { label: 'Basse',   color: '#64748B' },
};

export default function TachesList() {
    const [taches, setTaches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({});
    const [view, setView] = useState('kanban'); // 'kanban' | 'list'
    const [showModal, setShowModal] = useState(false);
    const [editTache, setEditTache] = useState(null);
    const [filtre, setFiltre] = useState({ priorite: '', categorie: '' });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [tRes, sRes] = await Promise.all([
                api.get('/taches?per_page=100'),
                api.get('/organisation/stats'),
            ]);
            setTaches(tRes.data?.data ?? []);
            setStats(sRes.data?.data ?? {});
        } catch (err) {
            console.error('Erreur chargement tâches:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = () => {
        setEditTache(null);
        setShowModal(true);
    };

    const handleEdit = (tache) => {
        setEditTache(tache);
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Voulez-vous vraiment supprimer cette tâche ?')) return;
        try {
            await api.delete(`/taches/${id}`);
            load();
        } catch (err) {
            alert('Erreur lors de la suppression');
        }
    };

    const handleStatutChange = async (tacheId, newStatut) => {
        try {
            await api.put(`/taches/${tacheId}`, { statut: newStatut });
            load();
        } catch (err) {
            console.error('Erreur changement statut:', err);
        }
    };

    const filtered = taches.filter(t => {
        if (filtre.priorite && t.priorite !== filtre.priorite) return false;
        if (filtre.categorie && t.categorie !== filtre.categorie) return false;
        return true;
    });

    return (
        <div className="erp-page" style={{ padding: '24px 32px', background: '#F8FAFC', minHeight: '100vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CheckSquare size={24} color="#2563EB" />
                        Organisation — Tâches
                    </h1>
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                        {stats.total ?? 0} tâche(s) au total — {stats.urgentes ?? 0} urgente(s) — {stats.en_retard ?? 0} en retard
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setView(view === 'kanban' ? 'list' : 'kanban')} style={btnSecondary}>
                        {view === 'kanban' ? '📋 Vue liste' : '📊 Vue Kanban'}
                    </button>
                    <button onClick={load} style={btnSecondary}><RefreshCw size={14} /> Actualiser</button>
                    <button onClick={handleCreate} style={btnPrimary}><Plus size={14} /> Nouvelle tâche</button>
                </div>
            </div>

            {/* Filtres */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <select value={filtre.priorite} onChange={(e) => setFiltre(f => ({ ...f, priorite: e.target.value }))} style={selectStyle}>
                    <option value="">Toutes priorités</option>
                    {Object.entries(PRIORITES).map(([k, p]) => (
                        <option key={k} value={k}>{p.label}</option>
                    ))}
                </select>
                <select value={filtre.categorie} onChange={(e) => setFiltre(f => ({ ...f, categorie: e.target.value }))} style={selectStyle}>
                    <option value="">Toutes catégories</option>
                    <option value="organisation">Organisation</option>
                    <option value="administratif">Administratif</option>
                    <option value="logistique">Logistique</option>
                    <option value="rh">Ressources humaines</option>
                    <option value="autre">Autre</option>
                </select>
            </div>

            {/* Vue Kanban */}
            {view === 'kanban' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', overflowX: 'auto' }}>
                    {STATUTS.map(statut => (
                        <KanbanColumn
                            key={statut.key}
                            statut={statut}
                            taches={filtered.filter(t => t.statut === statut.key)}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onMoveStatut={handleStatutChange}
                            statutsList={STATUTS}
                        />
                    ))}
                </div>
            )}

            {/* Vue Liste */}
            {view === 'list' && (
                <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ background: '#F8FAFC', borderBottom: '2px solid #E2E8F0' }}>
                                <th style={th}>Réf.</th>
                                <th style={th}>Titre</th>
                                <th style={th}>Priorité</th>
                                <th style={th}>Catégorie</th>
                                <th style={th}>Assigné</th>
                                <th style={th}>Échéance</th>
                                <th style={th}>Statut</th>
                                <th style={th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Aucune tâche.</td></tr>
                            ) : (
                                filtered.map(t => (
                                    <TacheRow key={t.id} tache={t} onEdit={handleEdit} onDelete={handleDelete} onMoveStatut={handleStatutChange} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal Création/Édition */}
            {showModal && (
                <TacheModal
                    tache={editTache}
                    onClose={() => setShowModal(false)}
                    onSaved={() => { setShowModal(false); load(); }}
                />
            )}
        </div>
    );
}

function KanbanColumn({ statut, taches, onEdit, onDelete, onMoveStatut, statutsList }) {
    return (
        <div style={{
            background: statut.bg,
            borderRadius: '10px',
            padding: '12px',
            minHeight: '400px',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
                padding: '0 4px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: statut.color,
                    }} />
                    <strong style={{ fontSize: '13px', color: '#1E293B' }}>{statut.label}</strong>
                </div>
                <span style={{
                    background: '#FFFFFF',
                    color: statut.color,
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '10px',
                }}>
                    {taches.length}
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {taches.map(t => (
                    <KanbanCard
                        key={t.id}
                        tache={t}
                        onEdit={() => onEdit(t)}
                        onDelete={() => onDelete(t.id)}
                        onMoveStatut={onMoveStatut}
                        statutsList={statutsList}
                    />
                ))}
                {taches.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '24px 8px',
                        color: '#94A3B8',
                        fontSize: '12px',
                        fontStyle: 'italic',
                    }}>
                        Aucune tâche
                    </div>
                )}
            </div>
        </div>
    );
}

function KanbanCard({ tache, onEdit, onDelete, onMoveStatut, statutsList }) {
    const priorite = PRIORITES[tache.priorite] || PRIORITES.normale;
    const enRetard = tache.est_en_retard;

    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: '8px',
            padding: '10px 12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            border: `1px solid ${priorite.color}30`,
            borderLeft: `3px solid ${priorite.color}`,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div style={{
                    fontSize: '10px',
                    color: priorite.color,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                }}>
                    {priorite.label}
                    {enRetard && ' • ⚠ Retard'}
                </div>
                <div style={{ display: 'flex', gap: '2px' }}>
                    <button onClick={onEdit} style={iconBtn} title="Modifier"><Edit3 size={12} /></button>
                    <button onClick={onDelete} style={iconBtn} title="Supprimer"><Trash2 size={12} /></button>
                </div>
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '4px' }}>
                {tache.titre}
            </div>
            {tache.description && (
                <div style={{
                    fontSize: '11px',
                    color: '#64748B',
                    marginBottom: '8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {tache.description}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10px', color: '#94A3B8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={10} />
                    {tache.assigne?.nom_complet ?? 'Non assigné'}
                </div>
                {tache.echeance && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        color: enRetard ? '#EF4444' : '#94A3B8',
                    }}>
                        <Clock size={10} />
                        {new Date(tache.echeance).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </div>
                )}
            </div>

            {/* Quick statut change */}
            <select
                value={tache.statut}
                onChange={(e) => onMoveStatut(tache.id, e.target.value)}
                style={{
                    width: '100%',
                    marginTop: '8px',
                    padding: '4px 6px',
                    fontSize: '10px',
                    border: '1px solid #E2E8F0',
                    borderRadius: '4px',
                    background: '#F8FAFC',
                }}
            >
                {statutsList.map(s => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                ))}
            </select>
        </div>
    );
}

function TacheRow({ tache, onEdit, onDelete, onMoveStatut }) {
    const priorite = PRIORITES[tache.priorite] || PRIORITES.normale;
    return (
        <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
            <td style={{ ...td, fontSize: '11px', color: '#94A3B8' }}>{tache.reference}</td>
            <td style={td}>
                <strong>{tache.titre}</strong>
                {tache.est_en_retard && (
                    <span style={{ marginLeft: '6px', fontSize: '10px', color: '#EF4444' }}>
                        <AlertTriangle size={10} style={{ verticalAlign: '-1px' }} /> En retard
                    </span>
                )}
            </td>
            <td style={td}>
                <span style={{
                    padding: '2px 8px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: `${priorite.color}20`,
                    color: priorite.color,
                }}>
                    {priorite.label}
                </span>
            </td>
            <td style={td}>{tache.categorie_label}</td>
            <td style={td}>{tache.assigne?.nom_complet ?? '—'}</td>
            <td style={td}>{tache.echeance ? new Date(tache.echeance).toLocaleDateString('fr-FR') : '—'}</td>
            <td style={td}>
                <select
                    value={tache.statut}
                    onChange={(e) => onMoveStatut(tache.id, e.target.value)}
                    style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #E2E8F0', borderRadius: '4px' }}
                >
                    {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
            </td>
            <td style={td}>
                <div style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => onEdit(tache)} style={iconBtn}><Edit3 size={12} /></button>
                    <button onClick={() => onDelete(tache.id)} style={iconBtn}><Trash2 size={12} /></button>
                </div>
            </td>
        </tr>
    );
}

function TacheModal({ tache, onClose, onSaved }) {
    const [form, setForm] = useState({
        titre: tache?.titre ?? '',
        description: tache?.description ?? '',
        priorite: tache?.priorite ?? 'normale',
        categorie: tache?.categorie ?? 'organisation',
        assigne_a: tache?.assigne_a ?? '',
        echeance: tache?.echeance ?? '',
        statut: tache?.statut ?? 'a_faire',
    });
    const [users, setUsers] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get('/users?per_page=100').then(res => setUsers(res.data?.data ?? res.data ?? [])).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = { ...form };
            if (!payload.assigne_a) delete payload.assigne_a;
            if (!payload.echeance) delete payload.echeance;

            if (tache?.id) {
                await api.put(`/taches/${tache.id}`, payload);
            } else {
                await api.post('/taches', payload);
            }
            onSaved();
        } catch (err) {
            console.error('Erreur sauvegarde:', err);
            alert('Erreur lors de la sauvegarde: ' + (err.response?.data?.message ?? err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
        }}>
            <form onSubmit={handleSubmit} style={{
                background: '#FFFFFF',
                borderRadius: '12px',
                padding: '24px',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>
                        {tache ? 'Modifier la tâche' : 'Nouvelle tâche'}
                    </h2>
                    <button type="button" onClick={onClose} style={iconBtn}><X size={18} /></button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <Field label="Titre *">
                        <input type="text" required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} style={input} placeholder="Ex: Préparer planning de garde" />
                    </Field>

                    <Field label="Description">
                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ ...input, minHeight: '80px' }} rows={3} />
                    </Field>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <Field label="Priorité">
                            <select value={form.priorite} onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))} style={input}>
                                {Object.entries(PRIORITES).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
                            </select>
                        </Field>

                        <Field label="Catégorie">
                            <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value }))} style={input}>
                                <option value="organisation">Organisation</option>
                                <option value="administratif">Administratif</option>
                                <option value="logistique">Logistique</option>
                                <option value="rh">Ressources humaines</option>
                                <option value="autre">Autre</option>
                            </select>
                        </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        <Field label="Assigné à">
                            <select value={form.assigne_a} onChange={e => setForm(f => ({ ...f, assigne_a: e.target.value }))} style={input}>
                                <option value="">Non assigné</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.nom} {u.prenom ?? ''} ({u.role})</option>
                                ))}
                            </select>
                        </Field>

                        <Field label="Échéance">
                            <input type="date" value={form.echeance} onChange={e => setForm(f => ({ ...f, echeance: e.target.value }))} style={input} />
                        </Field>
                    </div>

                    <Field label="Statut">
                        <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} style={input}>
                            {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                    </Field>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '24px' }}>
                    <button type="button" onClick={onClose} style={btnSecondary}>Annuler</button>
                    <button type="submit" disabled={saving} style={btnPrimary}>
                        {saving ? 'Enregistrement...' : (tache ? 'Modifier' : 'Créer')}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{label}</span>
            {children}
        </label>
    );
}

const input = {
    padding: '8px 12px',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    fontSize: '13px',
    background: '#FFFFFF',
    width: '100%',
    boxSizing: 'border-box',
};

const selectStyle = { ...input, minWidth: '180px' };

const btnPrimary = {
    background: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
};

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

const iconBtn = {
    background: 'none',
    border: 'none',
    color: '#64748B',
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
};

const th = { textAlign: 'left', padding: '10px 12px', fontWeight: 600, color: '#475569', fontSize: '11px', textTransform: 'uppercase' };
const td = { padding: '10px 12px', color: '#1E293B' };
