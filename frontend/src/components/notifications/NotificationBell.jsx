/**
 * NotificationBell — composant à insérer dans le topbar des 3 dashboards.
 * Affiche : icône Bell + badge avec le compteur de notifications non lues.
 * Au clic : ouvre un dropdown avec la liste des 10 dernières notifications.
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import {
    Bell, Check, CheckCheck, Trash2, BellOff, ExternalLink, X,
    Stethoscope, UserCheck, CheckCircle, XCircle, Flag, Wallet, Package, UserPlus,
} from 'lucide-react';

const ICON_MAP = {
    stethoscope: Stethoscope,
    'user-check': UserCheck,
    'check-circle': CheckCircle,
    'x-circle': XCircle,
    flag: Flag,
    wallet: Wallet,
    package: Package,
    'user-plus': UserPlus,
    bell: Bell,
};

export default function NotificationBell({ className = '', variant = 'dark' }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        connected,
    } = useNotifications();

    // Ferme le dropdown au clic extérieur
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)
                && buttonRef.current && !buttonRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    // Ferme le dropdown avec Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        if (open) {
            document.addEventListener('keydown', handleEsc);
        }
        return () => document.removeEventListener('keydown', handleEsc);
    }, [open]);

    const handleNotifClick = async (notif) => {
        if (!notif.est_lue) {
            await markAsRead(notif.id);
        }
        if (notif.url_cible) {
            navigate(notif.url_cible);
        }
        setOpen(false);
    };

    const top5 = notifications.slice(0, 10);

    // Styles selon la variante (dark pour le topbar sombre, light pour clair)
    const isDark = variant === 'dark';

    return (
        <div className="notif-bell-wrapper" style={{ position: 'relative' }}>
            <button
                ref={buttonRef}
                type="button"
                className={`erp-icon-btn ${className}`}
                onClick={() => setOpen((o) => !o)}
                aria-label={`Notifications - ${unreadCount} non lues`}
                aria-expanded={open}
                title={`Notifications ${unreadCount > 0 ? `(${unreadCount} non lues)` : ''}`}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span
                        className="erp-badge"
                        style={{
                            background: unreadCount >= 10 ? '#EF4444' : '#F59E0B',
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 700,
                            minWidth: '16px',
                            height: '16px',
                            borderRadius: '8px',
                            padding: '0 4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            border: '2px solid var(--bg-app, #F8FAFC)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                        }}
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
                {/* Indicateur de connexion Echo */}
                <span
                    className="notif-connection-dot"
                    style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: connected ? '#10B981' : '#94A3B8',
                        border: '2px solid var(--bg-app, #F8FAFC)',
                        transition: 'background 0.3s ease',
                    }}
                    title={connected ? 'Temps réel connecté' : 'Mode polling'}
                />
            </button>

            {open && (
                <div
                    ref={dropdownRef}
                    className="notif-dropdown"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        width: '420px',
                        maxHeight: '600px',
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
                        zIndex: 1000,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid #E2E8F0',
                            background: 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)',
                            color: '#FFFFFF',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Bell size={18} />
                            <strong style={{ fontSize: '15px' }}>Notifications</strong>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: 'rgba(255,255,255,0.25)',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                }}>
                                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {unreadCount > 0 && (
                                <button
                                    type="button"
                                    onClick={markAllAsRead}
                                    title="Tout marquer comme lu"
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        color: '#FFFFFF',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontWeight: 500,
                                    }}
                                >
                                    <CheckCheck size={14} />
                                    Tout lire
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    color: '#FFFFFF',
                                    padding: '6px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                }}
                                aria-label="Fermer"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Liste des notifications */}
                    <div style={{ overflowY: 'auto', maxHeight: '460px' }}>
                        {top5.length === 0 ? (
                            <div style={{
                                padding: '48px 20px',
                                textAlign: 'center',
                                color: '#64748B',
                            }}>
                                <BellOff size={36} style={{ marginBottom: '12px', opacity: 0.4 }} />
                                <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '4px' }}>
                                    Aucune notification
                                </div>
                                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                                    Vous serez notifié dès qu'un événement se produira.
                                </div>
                            </div>
                        ) : (
                            top5.map((notif) => (
                                <NotificationItem
                                    key={notif.id}
                                    notif={notif}
                                    onClick={() => handleNotifClick(notif)}
                                    onMarkRead={() => markAsRead(notif.id)}
                                    onDelete={() => deleteNotification(notif.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div style={{
                        padding: '12px 16px',
                        borderTop: '1px solid #E2E8F0',
                        background: '#F8FAFC',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px',
                        color: '#64748B',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: connected ? '#10B981' : '#94A3B8',
                            }} />
                            {connected ? 'Connecté en temps réel' : 'Mode polling (60s)'}
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate('/notifications')}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#2563EB',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                            }}
                        >
                            Voir tout
                            <ExternalLink size={12} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function NotificationItem({ notif, onClick, onMarkRead, onDelete }) {
    return (
        <div
            onClick={onClick}
            style={{
                padding: '14px 20px',
                borderBottom: '1px solid #F1F5F9',
                cursor: 'pointer',
                display: 'flex',
                gap: '12px',
                background: notif.est_lue ? '#FFFFFF' : '#EFF6FF',
                transition: 'background 0.15s ease',
                position: 'relative',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = notif.est_lue ? '#FFFFFF' : '#EFF6FF';
            }}
        >
            {/* Indicateur "non lue" */}
            {!notif.est_lue && (
                <span style={{
                    position: 'absolute',
                    left: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#2563EB',
                }} />
            )}

            {/* Icône */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: `${notif.couleur}15`,
                color: notif.couleur,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}>
                <NotifIcon name={notif.icone} />
            </div>

            {/* Contenu */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E293B',
                    marginBottom: '2px',
                    lineHeight: 1.3,
                }}>
                    {notif.titre}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: '#64748B',
                    lineHeight: 1.4,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {notif.message}
                </div>
                <div style={{
                    fontSize: '11px',
                    color: '#94A3B8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <span>{formatRelativeTime(notif.created_at)}</span>
                    {notif.url_cible && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <ExternalLink size={10} />
                            Voir
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                opacity: 0.4,
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0.4}
            onClick={(e) => e.stopPropagation()}
            >
                {!notif.est_lue && (
                    <button
                        type="button"
                        onClick={onMarkRead}
                        title="Marquer comme lue"
                        style={iconBtnStyle}
                    >
                        <Check size={14} />
                    </button>
                )}
                <button
                    type="button"
                    onClick={onDelete}
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
    padding: '4px',
    cursor: 'pointer',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

function NotifIcon({ name }) {
    const Icon = ICON_MAP[name] || Bell;
    return <Icon size={20} />;
}

function formatRelativeTime(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diff = (now - d) / 1000; // seconds
    if (diff < 60) return 'à l\'instant';
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}
