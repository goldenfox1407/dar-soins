#!/bin/bash
echo "==================================================="
echo "  Dar-Soins v2 - Demarrage complet (Backend + Frontend + WebSocket)"
echo "==================================================="

# Verifier le fichier .env du backend
if [ ! -f "backend/.env" ]; then
    echo "[INFO] Le fichier backend/.env n'existe pas. Creation a partir de .env.example..."
    cp backend/.env.example backend/.env
    cd backend
    php artisan key:generate
    cd ..
fi

echo "[INFO] Initialisation de la base de donnees..."
(cd backend && php init-db.php)

# Verifier que les dependances backend sont installees
if [ ! -d "backend/vendor/laravel/reverb" ]; then
    echo "[WARN] Laravel Reverb n'est pas installe. Lancez ./install-v2.sh d'abord."
    echo "[INFO] Continuons en mode degrade (pas de notifications temps reel)."
    REVERB_OK=false
else
    REVERB_OK=true
fi

# Verifier que les dependances frontend sont installees
if [ ! -d "frontend/node_modules/laravel-echo" ]; then
    echo "[WARN] laravel-echo n'est pas installe. Executez cd frontend && npm install"
fi

# Fonction pour arreter tous les processus en arriere-plan a la fermeture
cleanup() {
    echo ""
    echo "[INFO] Arret des serveurs..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

echo "[INFO] Lancement du serveur backend Laravel sur http://127.0.0.1:8000..."
(cd backend && php artisan serve) &

if [ "$REVERB_OK" = true ]; then
    echo "[INFO] Lancement du serveur WebSocket Reverb sur ws://127.0.0.1:8080..."
    (cd backend && php artisan reverb:start --debug) &

    echo "[INFO] Lancement du worker de queue (notifications async)..."
    (cd backend && php artisan queue:listen --tries=1 --timeout=0) &
else
    echo "[SKIP] Reverb + queue worker non lances (dependances manquantes)."
fi

echo "[INFO] Lancement du serveur de developpement frontend sur http://localhost:5173..."
(cd frontend && npm run dev) &

echo "==================================================="
echo "[SUCCESS] Serveurs lances !"
echo "  - API Laravel :       http://127.0.0.1:8000"
echo "  - WebSocket Reverb :  ws://127.0.0.1:8080"
echo "  - Frontend React :    http://localhost:5173"
echo ""
echo "Appuyez sur Ctrl+C pour arreter tous les serveurs."
echo "==================================================="

# Attendre
wait
