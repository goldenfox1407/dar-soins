<?php

$envFile = __DIR__ . '/.env';
if (!file_exists($envFile)) {
    echo "[INFO] Copie de .env.example vers .env...\n";
    copy(__DIR__ . '/.env.example', $envFile);
}

// Lire le .env
$env = [];
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($lines as $line) {
    $line = trim($line);
    if (empty($line) || strpos($line, '#') === 0) continue;
    if (strpos($line, '=') !== false) {
        list($name, $value) = explode('=', $line, 2);
        $env[trim($name)] = trim($value, " \t\n\r\0\x0B\"'");
    }
}

$connection = $env['DB_CONNECTION'] ?? 'pgsql';
$host = $env['DB_HOST'] ?? '127.0.0.1';
$port = $env['DB_PORT'] ?? '5432';
$database = $env['DB_DATABASE'] ?? 'darsoins';
$username = $env['DB_USERNAME'] ?? 'postgres';
$password = $env['DB_PASSWORD'] ?? '';

if ($connection === 'pgsql') {
    echo "[INFO] Connexion au serveur PostgreSQL $host:$port (user: $username)...\n";
    try {
        // Se connecter à la base "postgres" par défaut pour pouvoir créer notre base
        $dsn = "pgsql:host=$host;port=$port;dbname=postgres";
        $pdo = new PDO($dsn, $username, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

        // Vérifier si la base de données existe
        $stmt = $pdo->prepare("SELECT 1 FROM pg_database WHERE datname = ?");
        $stmt->execute([$database]);
        $exists = $stmt->fetchColumn();

        if (!$exists) {
            echo "[INFO] La base de donnees '$database' n'existe pas. Creation en cours...\n";
            $pdo->exec("CREATE DATABASE \"$database\"");
            echo "[SUCCESS] Base de donnees '$database' creee avec succes !\n";
        } else {
            echo "[INFO] La base de donnees '$database' existe deja.\n";
        }

        // Lancer les migrations et seeds
        echo "[INFO] Lancement des migrations et du seed...\n";
        passthru("php artisan migrate --seed");

    } catch (PDOException $e) {
        echo "\n[WARNING] Connexion a PostgreSQL impossible : " . $e->getMessage() . "\n";
        echo "Assurez-vous que votre serveur PostgreSQL est demarre et que les identifiants dans backend/.env sont corrects.\n\n";
    }
} else if ($connection === 'sqlite') {
    echo "[INFO] Utilisation de la base SQLite.\n";
    $sqlitePath = __DIR__ . '/database/database.sqlite';
    if (!file_exists($sqlitePath)) {
        touch($sqlitePath);
        echo "[INFO] Fichier database.sqlite cree.\n";
    }
    echo "[INFO] Lancement des migrations et du seed...\n";
    passthru("php artisan migrate --seed");
}
