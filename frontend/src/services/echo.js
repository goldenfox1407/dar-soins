/**
 * Echo configuration — singleton Laravel Echo pour les notifications temps réel.
 * Connexion au serveur Laravel Reverb via pusher-js.
 */
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const REVERB_APP_KEY = import.meta.env.VITE_REVERB_APP_KEY || 'darsoins_key';
const REVERB_HOST     = import.meta.env.VITE_REVERB_HOST || '127.0.0.1';
const REVERB_PORT     = import.meta.env.VITE_REVERB_PORT || '8080';
const REVERB_SCHEME   = import.meta.env.VITE_REVERB_SCHEME || 'http';

let echoInstance = null;

/**
 * Récupère le token d'auth stocké (sessionStorage) pour les requêtes d'autorisation
 * des canaux privés.
 */
function getAuthToken() {
    return sessionStorage.getItem('auth_token') || '';
}

/**
 * Initialise et retourne l'instance Echo (singleton).
 */
export function getEcho() {
    if (echoInstance) return echoInstance;

    window.Pusher = Pusher;

    echoInstance = new Echo({
        broadcaster: 'reverb',
        key: REVERB_APP_KEY,
        wsHost: REVERB_HOST,
        wsPort: parseInt(REVERB_PORT, 10),
        wssPort: parseInt(REVERB_PORT, 10),
        forceTLS: REVERB_SCHEME === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${getAuthToken()}`,
                Accept: 'application/json',
            },
        },
    });

    return echoInstance;
}

/**
 * Déconnecte proprement Echo (au logout).
 */
export function disconnectEcho() {
    if (echoInstance) {
        try {
            echoInstance.disconnect();
        } catch (e) {
            console.warn('[Echo] Erreur à la déconnexion:', e);
        }
        echoInstance = null;
    }
}

export default getEcho;
