#!/bin/bash
# =====================================================================
# Dar-Soins - Installation complète des nouvelles fonctionnalités v2
# Notifications temps réel + Rapports IA + Organisation
# =====================================================================
# Ce script installe les dépendances backend (Laravel Reverb + Pusher),
# publie les fichiers de config nécessaires, exécute les migrations
# et seeders, et installe les dépendances frontend (laravel-echo + pusher-js).
#
# Usage :
#   chmod +x install-v2.sh
#   ./install-v2.sh
# =====================================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "==================================================="
echo "  Dar-Soins v2 - Installation des nouvelles features"
echo "==================================================="
echo ""
echo "[INFO] Backend dir : $BACKEND_DIR"
echo "[INFO] Frontend dir: $FRONTEND_DIR"
echo ""

# ---------------------------------------------------
# 1. BACKEND - Installation des dépendances
# ---------------------------------------------------
echo "[STEP 1/8] Installation des dépendances backend (Laravel Reverb + Pusher)..."
cd "$BACKEND_DIR"

# Vérifie que composer est installé
if ! command -v composer &> /dev/null; then
    echo "[ERROR] Composer n'est pas installé. Installez-le depuis https://getcomposer.org/"
    exit 1
fi

# Installation de Reverb + Pusher PHP server
composer require laravel/reverb:"^1.0" pusher/pusher-php-server:"^7.2" --no-interaction

# Publication des fichiers de config Reverb
php artisan vendor:publish --provider="Laravel\Reverb\ReverbServiceProvider" --tag="reverb-config" --no-interaction || true

# ---------------------------------------------------
# 2. BACKEND - Fichier .env
# ---------------------------------------------------
echo ""
echo "[STEP 2/8] Configuration du fichier .env backend..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    php artisan key:generate
fi

# Ajoute les variables Reverb si elles n'existent pas déjà
if ! grep -q "^BROADCAST_CONNECTION=reverb" .env; then
    echo "" >> .env
    echo "# ===== Reverb (Notifications temps réel) =====" >> .env
    echo "BROADCAST_CONNECTION=reverb" >> .env
    echo "QUEUE_CONNECTION=database" >> .env
    echo "REVERB_APP_ID=darsoins_app" >> .env
    echo "REVERB_APP_KEY=darsoins_key" >> .env
    echo "REVERB_APP_SECRET=darsoins_secret" >> .env
    echo "REVERB_HOST=127.0.0.1" >> .env
    echo "REVERB_PORT=8080" >> .env
    echo "REVERB_SCHEME=http" >> .env
    echo "FRONTEND_URL=http://localhost:5173" >> .env
    echo "VITE_API_URL=http://127.0.0.1:8000/api" >> .env
    echo "VITE_REVERB_APP_KEY=\${REVERB_APP_KEY}" >> .env
    echo "VITE_REVERB_HOST=\${REVERB_HOST}" >> .env
    echo "VITE_REVERB_PORT=\${REVERB_PORT}" >> .env
    echo "VITE_REVERB_SCHEME=\${REVERB_SCHEME}" >> .env
    echo "[INFO] Variables Reverb ajoutées à .env"
else
    echo "[INFO] .env déjà configuré pour Reverb"
fi

# ---------------------------------------------------
# 3. BACKEND - Migrations + seeders
# ---------------------------------------------------
echo ""
echo "[STEP 3/8] Exécution des migrations..."

# Initialisation de la base si besoin (utilise init-db.php)
if [ -f "init-db.php" ]; then
    php init-db.php || true
fi

php artisan migrate --force

echo ""
echo "[STEP 4/8] Exécution des seeders (notifications + tâches de démo)..."
php artisan db:seed --class=NotifConfigSeeder --force || true
php artisan db:seed --class=TacheSeeder --force || true
php artisan db:seed --class=NotificationSeeder --force || true

# ---------------------------------------------------
# 4. BACKEND - Clear caches
# ---------------------------------------------------
echo ""
echo "[STEP 5/8] Nettoyage des caches backend..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan view:clear

# ---------------------------------------------------
# 5. FRONTEND - Installation des dépendances
# ---------------------------------------------------
echo ""
echo "[STEP 6/8] Installation des dépendances frontend (laravel-echo + pusher-js + recharts)..."
cd "$FRONTEND_DIR"

# Vérifie que npm est installé
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm n'est pas installé. Installez Node.js 20+ depuis https://nodejs.org/"
    exit 1
fi

npm install

# ---------------------------------------------------
# 6. FRONTEND - Fichier .env
# ---------------------------------------------------
echo ""
echo "[STEP 7/8] Configuration du fichier .env frontend..."

if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
VITE_API_URL=http://127.0.0.1:8000/api
VITE_REVERB_APP_KEY=darsoins_key
VITE_REVERB_HOST=127.0.0.1
VITE_REVERB_PORT=8080
VITE_REVERB_SCHEME=http
EOF
    echo "[INFO] .env frontend créé"
else
    # Vérifie que les variables sont présentes
    if ! grep -q "VITE_REVERB_APP_KEY" .env; then
        echo "" >> .env
        echo "VITE_REVERB_APP_KEY=darsoins_key" >> .env
        echo "VITE_REVERB_HOST=127.0.0.1" >> .env
        echo "VITE_REVERB_PORT=8080" >> .env
        echo "VITE_REVERB_SCHEME=http" >> .env
        echo "[INFO] Variables Reverb ajoutées au .env frontend"
    fi
fi

# ---------------------------------------------------
# 7. FRONTEND - Build de test (optionnel)
# ---------------------------------------------------
echo ""
echo "[STEP 8/8] Build frontend de test..."
npm run build || echo "[WARN] Le build a échoué, vérifiez les erreurs ci-dessus."

# ---------------------------------------------------
# Finalisation
# ---------------------------------------------------
echo ""
echo "==================================================="
echo "  ✅ INSTALLATION TERMINÉE"
echo "==================================================="
echo ""
echo "Prochaines étapes :"
echo ""
echo "1. Démarrez le serveur backend + Reverb + queue :"
echo "   cd backend && composer dev"
echo "   (cela démarre simultanément : php artisan serve, queue:listen, reverb:start, et npm run dev)"
echo ""
echo "2. OU démarrez chaque service séparément dans 4 terminaux :"
echo "   # Terminal 1 - API Laravel"
echo "   cd backend && php artisan serve"
echo ""
echo "   # Terminal 2 - WebSocket Reverb"
echo "   cd backend && php artisan reverb:start --debug"
echo ""
echo "   # Terminal 3 - Queue worker (pour les notifications async)"
echo "   cd backend && php artisan queue:listen --tries=1"
echo ""
echo "   # Terminal 4 - Frontend Vite"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Ouvrez http://localhost:5173 dans votre navigateur"
echo "   - Login : admin@dar-soins.com / password"
echo "   - Login : client@dar-soins.com / password"
echo "   - Login : infirmier@dar-soins.com / password"
echo ""
echo "Documentation complète : voir README.md (section Nouvelles fonctionnalités v2)"
echo ""
