@echo off
setlocal enabledelayedexpansion

:: Recuperer le chemin absolu du dossier contenant ce script
set "ROOT=%~dp0"
:: Supprimer le backslash final
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===================================================
echo   Demarrage de Dar-Soins (Backend + Frontend)
echo ===================================================
echo.

:: -------------------------------------------------------
:: 1. Installer les dependances PHP (composer install)
:: -------------------------------------------------------
if not exist "%ROOT%\backend\vendor" (
    echo [INFO] Le dossier backend\vendor n'existe pas. Installation des dependances PHP...
    pushd "%ROOT%\backend"
    call composer install
    if errorlevel 1 (
        echo [ERREUR] Echec de composer install. Verifiez que Composer est installe.
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Dependances PHP installees avec succes.
) else (
    echo [OK] Dependances PHP deja installees.
)

:: -------------------------------------------------------
:: 2. Installer les dependances frontend (npm install)
:: -------------------------------------------------------
if not exist "%ROOT%\frontend\node_modules" (
    echo [INFO] Le dossier frontend\node_modules n'existe pas. Installation des dependances Node.js...
    pushd "%ROOT%\frontend"
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Echec de npm install. Verifiez que Node.js est installe.
        popd
        pause
        exit /b 1
    )
    popd
    echo [OK] Dependances Node.js installees avec succes.
) else (
    echo [OK] Dependances Node.js deja installees.
)

:: -------------------------------------------------------
:: 3. Configurer le fichier .env du backend
:: -------------------------------------------------------
if not exist "%ROOT%\backend\.env" (
    echo [INFO] Le fichier backend\.env n'existe pas. Creation a partir de .env.example...
    copy "%ROOT%\backend\.env.example" "%ROOT%\backend\.env" >nul
    pushd "%ROOT%\backend"
    call php artisan key:generate
    popd
    echo [OK] Fichier .env cree et cle generee.
)

:: -------------------------------------------------------
:: 4. Initialisation de la base de donnees
:: -------------------------------------------------------
echo [INFO] Initialisation de la base de donnees...
pushd "%ROOT%\backend"
call php init-db.php
popd

:: -------------------------------------------------------
:: 5. Lancement des serveurs
:: -------------------------------------------------------
echo.
echo [INFO] Lancement du serveur backend Laravel sur http://127.0.0.1:8000...
start "Dar-Soins Backend" cmd /k "cd /d "%ROOT%\backend" && php artisan serve"

echo [INFO] Lancement du serveur de developpement frontend sur http://localhost:5173...
start "Dar-Soins Frontend" cmd /k "cd /d "%ROOT%\frontend" && npm run dev"

echo.
echo ===================================================
echo [SUCCESS] Les deux serveurs ont ete lances !
echo   - Backend  : http://127.0.0.1:8000
echo   - Frontend : http://localhost:5173
echo Gardez les deux fenetres ouvertes pour l'utilisation.
echo ===================================================
pause
