#!/bin/bash
echo "==================================================="
echo "  Demarrage de Dar-Soins (Backend + Frontend)"
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


# Fonction pour arreter tous les processus en arriere-plan a la fermeture
cleanup() {
    echo ""
    echo "[INFO] Arret des serveurs..."
    kill $(jobs -p)
    exit
}
trap cleanup SIGINT SIGTERM

echo "[INFO] Lancement du serveur backend Laravel sur http://127.0.0.1:8000..."
(cd backend && php artisan serve) &

echo "[INFO] Lancement du serveur de developpement frontend sur http://localhost:5173..."
(cd frontend && npm run dev) &

echo "==================================================="
echo "[SUCCESS] Les deux serveurs ont ete lances !"
echo "Appuyez sur Ctrl+C pour arreter les deux serveurs."
echo "==================================================="

# Attendre
wait
