@echo off
echo ===================================================
echo   Demarrage de Dar-Soins (Backend + Frontend)
echo ===================================================

:: Verifier le fichier .env du backend
if not exist "backend\.env" (
    echo [INFO] Le fichier backend\.env n'existe pas. Creation a partir de .env.example...
    copy "backend\.env.example" "backend\.env"
    cd backend
    php artisan key:generate
    cd ..
)

echo [INFO] Initialisation de la base de donnees...
cd backend
php init-db.php
cd ..


echo [INFO] Lancement du serveur backend Laravel sur http://127.0.0.1:8000...
start "Dar-Soins Backend" cmd /k "cd backend && php artisan serve"

echo [INFO] Lancement du serveur de developpement frontend sur http://localhost:5173...
start "Dar-Soins Frontend" cmd /k "cd frontend && npm run dev"

echo ===================================================
echo [SUCCESS] Les deux serveurs ont ete lances avec succes !
echo Gardez les deux fenetres ouvertes pour l'utilisation.
echo ===================================================
pause
