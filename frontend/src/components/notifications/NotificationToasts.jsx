/**
 * NotificationToasts — bande de toasts en haut à droite qui s'affichent
 * quand une nouvelle notification temps réel arrive.
 * À monter une seule fois dans AdminLayout (et optionnellement dans Client/Infirmier dashboards).
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { X } from 'lucide-react';

export default function NotificationToasts() {
    const { toasts, dismissToast, markAsRead } = useNotifications();
    const navigate = useNavigate();

    if (!toasts || toasts.length === 0) return null;

    const handleClick = async (toast) => {
        if (!toast.est_lue) await markAsRead(toast.id);
        if (toast.url_cible) navigate(toast.url_cible);
        dismissToast(toast.id);
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                maxWidth: '380px',
                pointerEvents: 'none',
            }}
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClick={() => handleClick(toast)}
                    onClose={() => dismissToast(toast.id)}
                />
            ))}
        </div>
    );
}

function Toast({ toast, onClick, onClose }) {
    return (
        <div
            onClick={onClick}
            style={{
                background: '#FFFFFF',
                borderLeft: `4px solid ${toast.couleur || '#2563EB'}`,
                borderRadius: '8px',
                padding: '14px 16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
                cursor: 'pointer',
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                pointerEvents: 'auto',
                animation: 'notif-slide-in 0.3s ease-out',
                position: 'relative',
                minWidth: '320px',
            }}
        >
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: `${toast.couleur || '#2563EB'}15`,
                color: toast.couleur || '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: '14px',
                fontWeight: 700,
            }}>
                ●
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E293B',
                    marginBottom: '2px',
                }}>
                    {toast.titre}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: '#64748B',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}>
                    {toast.message}
                </div>
            </div>

            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '2px',
                    flexShrink: 0,
                }}
                aria-label="Fermer"
            >
                <X size={14} />
            </button>

            <style>{`
                @keyframes notif-slide-in {
                    from { transform: translateX(400px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
