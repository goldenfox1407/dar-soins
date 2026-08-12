@echo off
echo ===================================================
echo   Demarrage de Dar-Soins (Backend + Frontend)
echo ===================================================

:: Verifier et installer les dependances backend (vendor/)
if not exist "backend\vendor" (
    echo [INFO] Le dossier backend\vendor n'existe pas. Installation des dependances PHP...
    cd backend
    composer install
    if errorlevel 1 (
        echo [ERREUR] Echec de composer install. Verifiez que Composer est installe.
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Dependances PHP installees avec succes.
) else (
    echo [OK] Dependances PHP deja installees.
)

:: Verifier et installer les dependances frontend (node_modules/)
if not exist "frontend\node_modules" (
    echo [INFO] Le dossier frontend\node_modules n'existe pas. Installation des dependances Node.js...
    cd frontend
    npm install
    if errorlevel 1 (
        echo [ERREUR] Echec de npm install. Verifiez que Node.js est installe.
        pause
        exit /b 1
    )
    cd ..
    echo [OK] Dependances Node.js installees avec succes.
) else (
    echo [OK] Dependances Node.js deja installees.
)

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
