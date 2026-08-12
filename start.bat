@echo off
setlocal enabledelayedexpansion

:: Recuperer le chemin absolu du dossier contenant ce script
set "ROOT=%~dp0"
:: Supprimer le backslash final
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo ===================================================
echo   Demarrage de Dar-Soins (PostgreSQL + Backend + Frontend)
echo ===================================================
echo.

:: -------------------------------------------------------
:: 0. Detection automatique de PostgreSQL
:: -------------------------------------------------------
set "PG_BIN="

:: Chercher dans Program Files (versions 18 a 13)
for %%V in (18 17 16 15 14 13) do (
    if not defined PG_BIN (
        if exist "C:\Program Files\PostgreSQL\%%V\bin\psql.exe" (
            set "PG_BIN=C:\Program Files\PostgreSQL\%%V\bin"
            echo [OK] PostgreSQL %%V detecte.
        )
    )
)

:: Si pas trouve dans Program Files, chercher dans le PATH
if not defined PG_BIN (
    where psql >nul 2>&1
    if not errorlevel 1 (
        for /f "delims=" %%P in ('where psql') do (
            if not defined PG_BIN (
                set "PG_BIN=%%~dpP"
            )
        )
        echo [OK] PostgreSQL detecte dans le PATH.
    )
)

if not defined PG_BIN (
    echo [ERREUR] PostgreSQL introuvable.
    echo          Installez-le depuis https://www.postgresql.org/download/windows/
    pause
    exit /b 1
)

:: -------------------------------------------------------
:: 0b. Detecter et demarrer le service PostgreSQL
:: -------------------------------------------------------
echo.
echo [INFO] Verification du service PostgreSQL...

set "PG_SERVICE="
for %%N in (postgresql-x64-18 postgresql-x64-17 postgresql-x64-16 postgresql-x64-15 postgresql) do (
    if not defined PG_SERVICE (
        sc query "%%N" >nul 2>&1
        if not errorlevel 1 (
            set "PG_SERVICE=%%N"
        )
    )
)

if defined PG_SERVICE (
    :: Verifier si le service tourne
    sc query "!PG_SERVICE!" | findstr /i "RUNNING" >nul 2>&1
    if errorlevel 1 (
        echo [INFO] Le service !PG_SERVICE! n'est pas demarre. Tentative de demarrage...
        net start "!PG_SERVICE!" >nul 2>&1
        if errorlevel 1 (
            echo [WARNING] Impossible de demarrer le service automatiquement.
            echo           Lancez ce script en tant qu'Administrateur ou demarrez PostgreSQL manuellement.
            pause
            exit /b 1
        )
        echo [OK] Service PostgreSQL demarre.
    ) else (
        echo [OK] Service PostgreSQL en cours d'execution.
    )
) else (
    echo [WARNING] Aucun service PostgreSQL detecte. Tentative de connexion directe...
)

:: Verifier la connectivite
"!PG_BIN!\pg_isready.exe" -h 127.0.0.1 -p 5432 >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] PostgreSQL ne repond pas sur 127.0.0.1:5432
    echo          Verifiez que le serveur est demarre et ecoute sur le port 5432.
    pause
    exit /b 1
)
echo [OK] PostgreSQL repond sur 127.0.0.1:5432

:: -------------------------------------------------------
:: 1. Installer les dependances PHP (composer install)
:: -------------------------------------------------------
echo.
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
:: 3. Configurer le fichier .env du backend (forcer PostgreSQL)
:: -------------------------------------------------------
echo.
if not exist "%ROOT%\backend\.env" (
    echo [INFO] Le fichier backend\.env n'existe pas. Creation a partir de .env.example...
    copy "%ROOT%\backend\.env.example" "%ROOT%\backend\.env" >nul
    echo [OK] Fichier .env cree.
)

:: S'assurer que DB_CONNECTION est pgsql
findstr /c:"DB_CONNECTION=pgsql" "%ROOT%\backend\.env" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Configuration de la base de donnees sur PostgreSQL...
    pushd "%ROOT%\backend"
    powershell -Command "(Get-Content '.env') -replace '^DB_CONNECTION=.*', 'DB_CONNECTION=pgsql' | Set-Content '.env'"
    popd
    echo [OK] .env configure pour PostgreSQL.
) else (
    echo [OK] .env deja configure pour PostgreSQL.
)

:: Generer la cle si elle n'existe pas
findstr /c:"APP_KEY=base64:" "%ROOT%\backend\.env" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Generation de la cle d'application...
    pushd "%ROOT%\backend"
    call php artisan key:generate
    popd
    echo [OK] Cle d'application generee.
)

:: -------------------------------------------------------
:: 4. Creation de la base de donnees PostgreSQL
:: -------------------------------------------------------
echo.
echo [INFO] Verification de la base de donnees PostgreSQL...

:: Lire les parametres depuis le .env
set "DB_NAME=darsoins"
set "DB_USER=postgres"
set "DB_PASS=secret"
set "DB_HOST=127.0.0.1"
set "DB_PORT=5432"

for /f "usebackq tokens=1,* delims==" %%A in ("%ROOT%\backend\.env") do (
    if "%%A"=="DB_DATABASE" set "DB_NAME=%%B"
    if "%%A"=="DB_USERNAME" set "DB_USER=%%B"
    if "%%A"=="DB_PASSWORD" set "DB_PASS=%%B"
    if "%%A"=="DB_HOST" set "DB_HOST=%%B"
    if "%%A"=="DB_PORT" set "DB_PORT=%%B"
)

:: Utiliser PGPASSWORD pour eviter le prompt
set "PGPASSWORD=!DB_PASS!"

:: Verifier si la base existe
"!PG_BIN!\psql.exe" -h !DB_HOST! -p !DB_PORT! -U !DB_USER! -lqt 2>nul | findstr /c:"!DB_NAME!" >nul 2>&1
if errorlevel 1 (
    echo [INFO] La base de donnees '!DB_NAME!' n'existe pas. Creation en cours...
    "!PG_BIN!\psql.exe" -h !DB_HOST! -p !DB_PORT! -U !DB_USER! -c "CREATE DATABASE \"!DB_NAME!\";" 2>nul
    if errorlevel 1 (
        echo [ERREUR] Echec de la creation de la base de donnees.
        echo          Verifiez les identifiants PostgreSQL dans backend\.env
        pause
        exit /b 1
    )
    echo [OK] Base de donnees '!DB_NAME!' creee avec succes.
) else (
    echo [OK] La base de donnees '!DB_NAME!' existe deja.
)

:: Nettoyer la variable
set "PGPASSWORD="

:: -------------------------------------------------------
:: 5. Migrations et Seeders Laravel
:: -------------------------------------------------------
echo.
echo [INFO] Lancement des migrations Laravel...
pushd "%ROOT%\backend"
call php artisan migrate --force
echo.
echo [INFO] Lancement des seeders...
call php artisan db:seed --force 2>nul
echo [OK] Migrations et seeders termines.
popd

:: -------------------------------------------------------
:: 6. Clear caches Laravel
:: -------------------------------------------------------
echo.
echo [INFO] Nettoyage des caches Laravel...
pushd "%ROOT%\backend"
call php artisan config:clear >nul 2>&1
call php artisan cache:clear >nul 2>&1
call php artisan route:clear >nul 2>&1
call php artisan view:clear >nul 2>&1
echo [OK] Caches nettoyes.
popd

:: -------------------------------------------------------
:: 7. Lancement des serveurs
:: -------------------------------------------------------
echo.
echo [INFO] Lancement du serveur backend Laravel sur http://127.0.0.1:8000...
start "Dar-Soins Backend" cmd /k "cd /d "%ROOT%\backend" && php artisan serve"

echo [INFO] Lancement du serveur frontend sur http://localhost:5173...
start "Dar-Soins Frontend" cmd /k "cd /d "%ROOT%\frontend" && npm run dev"

echo.
echo ===================================================
echo [SUCCESS] Tout est pret !
echo.
echo   Base de donnees : PostgreSQL (!DB_NAME!)
echo   Backend         : http://127.0.0.1:8000
echo   Frontend        : http://localhost:5173
echo.
echo   Gardez les deux fenetres ouvertes.
echo ===================================================
pause
