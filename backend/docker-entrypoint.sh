#!/bin/bash
set -e

echo "============================================="
echo "🚀 Initialisation de l'environnement Laravel"
echo "============================================="

# Copier le .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📄 Fichier .env manquant, copie depuis .env.example..."
    cp .env.example .env
fi

# Installation des dépendances sans interaction
echo "📦 Installation des dépendances Composer..."
composer install --no-interaction --prefer-dist --optimize-autoloader

# Génération de la clé de l'app si vide
echo "🔑 Génération de la clé d'application..."
php artisan key:generate --force

echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 5

echo "🗄️ Exécution des migrations de la base de données..."
php artisan migrate --force

echo "🌱 Injection des données de test (Seeders)..."
php artisan db:seed --force || true

echo "🧹 Nettoyage des caches..."
php artisan optimize:clear

echo "✅ Prêt ! Démarrage du serveur Apache..."
exec apache2-foreground
