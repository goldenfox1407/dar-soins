/**
 * NotificationContext — contexte React global qui :
 *  1. Récupère les notifications de l'utilisateur connecté au montage
 *  2. S'abonne au canal privé `notifications.{userId}` via Laravel Echo / Reverb
 *  3. Expose { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading }
 *
 * À placer en sibling de <AuthProvider> dans main.jsx.
 */
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';
import api from '../services/api';
import { getEcho, disconnectEcho } from '../services/echo';

const NotificationContext = createContext(null);

const TOAST_AUTOHIDE_MS = 6000;
const MAX_TOASTS = 4;

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [toasts, setToasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState(false);

    const userRef = useRef(null);
    const pollingRef = useRef(null);

    /**
     * Charge les notifications initiales + compteur non-lues.
     */
    const loadInitial = useCallback(async () => {
        try {
            const [listRes, countRes] = await Promise.all([
                api.get('/notifications?per_page=30'),
                api.get('/notifications/unread-count'),
            ]);
            if (listRes.data?.success !== false) {
                setNotifications(listRes.data?.data ?? []);
            }
            setUnreadCount(countRes.data?.count ?? 0);
        } catch (err) {
            console.warn('[Notifications] Erreur chargement initial:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Ajoute une notification temps réel + toast.
     */
    const pushRealtime = useCallback((notif) => {
        // notif vient de la payload broadcast (BroadcastNotificationCreated)
        const normalized = normalizeNotification(notif);
        if (!normalized) return;

        setNotifications((prev) => {
            if (prev.some((n) => n.id === normalized.id)) return prev;
            return [normalized, ...prev].slice(0, 100);
        });
        setUnreadCount((c) => c + 1);

        // Toast si not nouveau
        setToasts((prev) => {
            const newToasts = [...prev, normalized];
            return newToasts.slice(-MAX_TOASTS);
        });

        // Auto-hide toast
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== normalized.id));
        }, TOAST_AUTOHIDE_MS);

        // Petit beep système (optionnel)
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            oscillator.connect(gain);
            gain.connect(audioCtx.destination);
            oscillator.frequency.value = 880;
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            /* silent fail */
        }
    }, []);

    /**
     * Abonnement Echo au canal privé notifications.{userId}.
     */
    const subscribeEcho = useCallback((userId) => {
        if (!userId) return;

        const echo = getEcho();
        if (!echo) return;

        const channelName = `notifications.${userId}`;
        echo.private(channelName)
            .notification((notif) => {
                pushRealtime(notif);
            })
            .subscribed(() => {
                setConnected(true);
            })
            .error((err) => {
                console.error('[Echo] Erreur abonnement canal:', err);
                setConnected(false);
            });
    }, [pushRealtime]);

    /**
     * Démarre un polling de secours (toutes les 60s) au cas où Echo échouerait.
     */
    const startPolling = useCallback(() => {
        if (pollingRef.current) return;
        pollingRef.current = setInterval(async () => {
            try {
                const res = await api.get('/notifications/unread-count');
                const newCount = res.data?.count ?? 0;
                setUnreadCount((prev) => {
                    if (newCount > prev) {
                        // Recharger les notifications si une nouvelle est arrivée
                        loadInitial();
                    }
                    return newCount;
                });
            } catch (e) {
                /* silent */
            }
        }, 60000);
    }, [loadInitial]);

    /**
     * Initialise le contexte quand l'utilisateur est connecté.
     */
    const init = useCallback((user) => {
        if (!user?.id) return;
        userRef.current = user;
        loadInitial();
        subscribeEcho(user.id);
        startPolling();
    }, [loadInitial, subscribeEcho, startPolling]);

    /**
     * Nettoie tout (logout).
     */
    const cleanup = useCallback(() => {
        disconnectEcho();
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
        setNotifications([]);
        setUnreadCount(0);
        setToasts([]);
        setConnected(false);
        setLoading(true);
    }, []);

    /**
     * Écoute les events custom de AuthContext pour s'initialiser/se nettoyer.
     * Au montage, si l'utilisateur était déjà connecté, on init aussi.
     */
    useEffect(() => {
        const handleLogin = (e) => {
            const { user: u } = e.detail || {};
            if (u?.id) init(u);
        };
        const handleLogout = () => {
            cleanup();
        };

        window.addEventListener('auth:login', handleLogin);
        window.addEventListener('auth:logout', handleLogout);

        // Init initial si déjà connecté au montage
        try {
            const rawUser = sessionStorage.getItem('user');
            if (rawUser) {
                const u = JSON.parse(rawUser);
                if (u?.id) init(u);
            }
        } catch (e) {
            console.warn('[Notifications] Pas d\'utilisateur au montage:', e);
        }

        return () => {
            window.removeEventListener('auth:login', handleLogin);
            window.removeEventListener('auth:logout', handleLogout);
            cleanup();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Marque une notification comme lue.
     */
    const markAsRead = useCallback(async (notifId) => {
        // Optimistic UI
        setNotifications((prev) =>
            prev.map((n) => (n.id === notifId ? { ...n, est_lue: true, read_at: new Date().toISOString() } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));

        try {
            await api.post(`/notifications/${notifId}/mark-read`);
        } catch (err) {
            console.warn('[Notifications] Erreur markAsRead:', err);
        }
    }, []);

    /**
     * Marque toutes les notifications comme lues.
     */
    const markAllAsRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, est_lue: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);

        try {
            await api.post('/notifications/mark-all-read');
        } catch (err) {
            console.warn('[Notifications] Erreur markAllAsRead:', err);
        }
    }, []);

    /**
     * Supprime une notification.
     */
    const deleteNotification = useCallback(async (notifId) => {
        const previous = notifications;
        setNotifications((prev) => prev.filter((n) => n.id !== notifId));

        try {
            await api.delete(`/notifications/${notifId}`);
            // Recompute unreadCount
            const res = await api.get('/notifications/unread-count');
            setUnreadCount(res.data?.count ?? 0);
        } catch (err) {
            console.warn('[Notifications] Erreur suppression:', err);
            setNotifications(previous);
        }
    }, [notifications]);

    /**
     * Ferme un toast manuellement.
     */
    const dismissToast = useCallback((toastId) => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
    }, []);

    /**
     * Expose une méthode pour trigger l'init depuis AuthContext.
     */
    const value = {
        notifications,
        unreadCount,
        toasts,
        loading,
        connected,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        dismissToast,
        init,
        cleanup,
        refresh: loadInitial,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

/**
 * Normalise une notification reçue du backend (polling ou broadcast).
 */
function normalizeNotification(raw) {
    if (!raw) return null;

    // Format Laravel standard : { id, type, data: {...} }
    if (raw.data) {
        const data = typeof raw.data === 'string' ? JSON.parse(raw.data) : raw.data;
        return {
            id: raw.id,
            type: raw.type,
            evenement: data.evenement ?? null,
            titre: data.titre ?? 'Notification',
            message: data.message ?? '',
            icone: data.icone ?? 'bell',
            couleur: data.couleur ?? '#2563EB',
            url_cible: data.url_cible ?? null,
            extra: data.extra ?? {},
            est_lue: !!raw.read_at,
            read_at: raw.read_at ?? null,
            created_at: raw.created_at ?? new Date().toISOString(),
        };
    }

    // Format déjà normalisé (echo broadcast)
    return {
        id: raw.id ?? `${Date.now()}-${Math.random()}`,
        type: raw.type ?? 'broadcast',
        evenement: raw.evenement ?? null,
        titre: raw.titre ?? 'Notification',
        message: raw.message ?? '',
        icone: raw.icone ?? 'bell',
        couleur: raw.couleur ?? '#2563EB',
        url_cible: raw.url_cible ?? null,
        extra: raw.extra ?? {},
        est_lue: false,
        read_at: null,
        created_at: raw.created_at ?? new Date().toISOString(),
    };
}

/**
 * Hook pour consommer le contexte.
 */
export function useNotifications() {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotifications doit être utilisé dans <NotificationProvider>');
    }
    return ctx;
}
