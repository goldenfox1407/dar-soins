/**
 * Centre de notifications — page complète pour consulter / filtrer / gérer
 * l'historique des notifications.
 *
 * Route: /notifications (accessible par tous les utilisateurs connectés)
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, Search } from 'lucide-react';
import api from '../../services/api';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export default function NotificationsCentre() {
    const [allNotifs, setAllNotifs] = useState([]);
    const [meta, setMeta] = useState({ total: 0, current_page: 1, last_page: 1 });
    const [page, setPage] = useState(1);
    const [filtre, setFiltre] = useState('all'); // all | unread | read
    const [evenement, setEvenement] = useState('');
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { markAsRead, markAllAsRead, deleteNotification, refresh } = useNotifications();
    const navigate = useNavigate();

    const loadPage = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ per_page: 25, page });
            if (filtre === 'unread') params.set('unread', '1');
            if (filtre === 'read') params.set('read', '1');
            if (evenement) params.set('evenement', evenement);

            const res = await api.get(`/notifications?${params.toString()}`);
            if (res.data?.success !== false) {
                setAllNotifs(res.data?.data ?? []);
                setMeta(res.data?.meta ?? {});
            }
        } catch (err) {
            console.error('Erreur chargement notifications:', err);
        } finally {
            setLoading(false);
        }
    }, [page, filtre, evenement]);

    useEffect(() => {
        loadPage();
    }, [loadPage]);

    const handleNotifClick = async (notif) => {
        if (!notif.est_lue) await markAsRead(notif.id);
        if (notif.url_cible) navigate(notif.url_cible);
    };

    const handleDelete = async (id) => {
        await deleteNotification(id);
        loadPage();
    };

    const filtered = allNotifs.filter((n) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            n.titre?.toLowerCase().includes(s) ||
            n.message?.toLowerCase().includes(s)
        );
    });

    return (
        <div className="erp-page">
            <div className="erp-page-header" style={{
                padding: '24px 32px',
                borderBottom: '1px solid #E2E8F0',
                background: '#FFFFFF',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                            <Bell size={22} style={{ marginRight: '8px', verticalAlign: '-3px', color: '#2563EB' }} />
                            Centre de notifications
                        </h1>
                        <p style={{ fontSize: '13px', color: '#64748B' }}>
                            Historique complet de vos notifications.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={async () => {
                            await markAllAsRead();
                            loadPage();
                        }}
                        className="erp-btn-secondary"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <CheckCheck size={16} />
                        Tout marquer comme lu
                    </button>
                </div>
            </div>

            {/* Filtres */}
            <div style={{
                padding: '16px 32px',
                background: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap',
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
                    <Search size={16} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#94A3B8',
                    }} />
                    <input
                        type="text"
                        placeholder="Rechercher dans les notifications..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 12px 10px 36px',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            fontSize: '13px',
                            background: '#FFFFFF',
                        }}
                    />
                </div>

                <select
                    value={filtre}
                    onChange={(e) => setFiltre(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        background: '#FFFFFF',
                    }}
                >
                    <option value="all">Toutes</option>
                    <option value="unread">Non lues</option>
                    <option value="read">Lues</option>
                </select>

                <select
                    value={evenement}
                    onChange={(e) => setEvenement(e.target.value)}
                    style={{
                        padding: '10px 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '8px',
                        fontSize: '13px',
                        background: '#FFFFFF',
                    }}
                >
                    <option value="">Tous les événements</option>
                    <option value="nouvelle_intervention">Nouvelle intervention</option>
                    <option value="infirmier_affecte">Infirmier affecté</option>
                    <option value="devis_accepte">Devis accepté</option>
                    <option value="devis_refuse">Devis refusé</option>
                    <option value="intervention_cloturee">Intervention clôturée</option>
                    <option value="paiement_recu">Paiement reçu</option>
                    <option value="stock_alerte">Alerte stock</option>
                    <option value="nouveau_client">Nouveau client</option>
                </select>
            </div>

            {/* Liste */}
            <div style={{ padding: '24px 32px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#94A3B8' }}>
                        Chargement...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 0',
                        color: '#94A3B8',
                    }}>
                        <Bell size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                        <div style={{ fontSize: '15px', fontWeight: 500, color: '#64748B', marginBottom: '4px' }}>
                            Aucune notification trouvée
                        </div>
                        <div style={{ fontSize: '12px' }}>
                            {search || filtre !== 'all' || evenement
                                ? 'Essayez de modifier vos filtres.'
                                : 'Vous serez notifié dès qu\'un événement se produira.'}
                        </div>
                    </div>
                ) : (
                    <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        overflow: 'hidden',
                    }}>
                        {filtered.map((notif, idx) => (
                            <NotifRow
                                key={notif.id}
                                notif={notif}
                                onClick={() => handleNotifClick(notif)}
                                onMarkRead={() => markAsRead(notif.id)}
                                onDelete={() => handleDelete(notif.id)}
                                isLast={idx === filtered.length - 1}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta.last_page > 1 && (
                    <div style={{
                        marginTop: '20px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '4px',
                    }}>
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page === 1}
                            style={page === 1 ? paginationDisabledStyle : paginationButtonStyle}
                        >
                            ← Précédent
                        </button>
                        <span style={{
                            padding: '8px 16px',
                            color: '#64748B',
                            fontSize: '13px',
                        }}>
                            Page {meta.current_page} / {meta.last_page} ({meta.total} au total)
                        </span>
                        <button
                            onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                            disabled={page === meta.last_page}
                            style={page === meta.last_page ? paginationDisabledStyle : paginationButtonStyle}
                        >
                            Suivant →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function NotifRow({ notif, onClick, onMarkRead, onDelete, isLast }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '16px 20px',
                borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                cursor: 'pointer',
                display: 'flex',
                gap: '14px',
                background: notif.est_lue ? '#FFFFFF' : '#EFF6FF',
                transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = notif.est_lue ? '#FFFFFF' : '#EFF6FF';
            }}
        >
            <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: `${notif.couleur || '#2563EB'}15`,
                color: notif.couleur || '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{notif.icone === 'stethoscope' ? '🏥' :
                    notif.icone === 'user-check' ? '👨‍⚕️' :
                    notif.icone === 'check-circle' ? '✅' :
                    notif.icone === 'x-circle' ? '❌' :
                    notif.icone === 'flag' ? '🏁' :
                    notif.icone === 'wallet' ? '💰' :
                    notif.icone === 'package' ? '📦' :
                    notif.icone === 'user-plus' ? '👤' : '🔔'}</span>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{
                        fontSize: '14px',
                        color: '#1E293B',
                        fontWeight: 600,
                    }}>
                        {notif.titre}
                    </strong>
                    {!notif.est_lue && (
                        <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#2563EB',
                            display: 'inline-block',
                        }} />
                    )}
                </div>
                <div style={{
                    fontSize: '13px',
                    color: '#64748B',
                    lineHeight: 1.5,
                    marginBottom: '6px',
                }}>
                    {notif.message}
                </div>
                <div style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    <span>{notif.il_y_a || formatRelative(notif.created_at)}</span>
                    {notif.evenement && (
                        <span style={{
                            background: '#F1F5F9',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            fontWeight: 500,
                            color: '#475569',
                        }}>
                            {notif.evenement.replace(/_/g, ' ')}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
                {!notif.est_lue && (
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onMarkRead(); }}
                        title="Marquer comme lue"
                        style={iconBtnStyle}
                    >
                        <Check size={14} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    title="Supprimer"
                    style={iconBtnStyle}
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

const iconBtnStyle = {
    background: 'none',
    border: 'none',
    color: '#64748B',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

const paginationButtonStyle = {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    color: '#1E293B',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 500,
};

const paginationDisabledStyle = {
    ...paginationButtonStyle,
    opacity: 0.5,
    cursor: 'not-allowed',
};

function formatRelative(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}
