# Dar-Soins Maroc — Plateforme de Soins Infirmiers à Domicile

> Version 2.0 — Notifications temps réel, Rapports IA et module Organisation ajoutés

## 🆕 Nouveautés v2.0

Cette version 2.0 introduit trois nouvelles fonctionnalités majeures :

### 1. 🔔 Système de Notifications Temps Réel
- **WebSocket via Laravel Reverb** (officiel Laravel, pusher-compatible, gratuit)
- Notifications en direct entre les 3 rôles : **Client**, **Infirmier**, **Admin/Gestionnaire**
- 8 événements pré-configurés :
  - Nouvelle demande d'intervention
  - Infirmier affecté à une intervention
  - Devis accepté / refusé par le client
  - Intervention clôturée
  - Paiement reçu
  - Alerte stock bas
  - Nouveau client inscrit
- 3 canaux configurables par événement : **Email**, **SMS**, **App** (in-app + WebSocket)
- Bell avec badge dans le topbar des 3 dashboards
- Centre de notifications complet avec filtres
- Toasts temps réel animés en haut à droite
- Polling de secours (60s) si WebSocket défaillant
- Persistance en base (historique consultable)

### 2. 🤖 Rubrique Admin "Rapports & IA"
4 pages complètes avec graphiques (Recharts) :

- **AI Reports** (`/gestionnaire/ai-reports`) :
  - Synthèse IA (analyse en langage naturel des KPIs)
  - Détection d'anomalies (stock critique, baisse de revenus, infirmier surchargé, interventions en attente)
  - Prévisions 30 jours (revenus, interventions, taux d'occupation)
  - Recommandations stratégiques (actions prioritaires)
- **Rapport de Stock** : alertes, ruptures, valeur du stock, répartition par catégorie
- **Rapport des Ventes** : évolution, top produits, panier moyen
- **Rapport des Achats** : évolution, statuts, top fournisseurs

### 3. 📋 Rubrique Admin "Organisation"
- **Tâches** (`/gestionnaire/taches`) :
  - Vue Kanban (5 colonnes : À faire / En cours / En revue / Terminée / Annulée)
  - Vue liste alternative
  - Création / édition / suppression via modal
  - Affectation aux utilisateurs
  - Priorités (Urgente / Haute / Normale / Basse)
  - Catégories (Organisation, Administratif, Logistique, RH, Autre)
  - Détection des retards
  - Référence auto-générée (`TACHE-2026-0042`)
- **Calendrier** (`/gestionnaire/calendrier`) :
  - Vue hebdomadaire
  - Navigation entre semaines
  - Affichage combiné des tâches + interventions par jour

---

## Stack Technologique

### Backend
- **PHP 8.2+**
- **Laravel 12**
- **Laravel Reverb** (WebSocket server — temps réel)
- **Laravel Sanctum** (Authentification)
- **Spatie Permissions** (RBAC)
- **DomPDF** (Génération PDF)
- **Pusher PHP Server** (client broadcasting)

### Frontend
- **React 19**
- **Vite 5**
- **React Router v7**
- **Axios**
- **Laravel Echo + Pusher-js** (client WebSocket)
- **Recharts** (graphiques)
- **Tailwind CSS** (Design System)
- **Lucide React** (icônes)

### Base de données
- **PostgreSQL 15** (prod) ou **SQLite** (développement local)
- **Redis 7** (cache, optionnel)

---

## Installation

### Pré-requis
- PHP 8.2+ avec extensions : `pdo, pdo_pgsql, mbstring, xml, csv, zlib, gd`
- Composer 2.6+
- Node.js 20+ et npm 10+
- (Optionnel) PostgreSQL 15 / Redis 7

### Installation rapide (recommandée)

```bash
# Cloner le repo
git clone https://github.com/goldenfox1407/dar-soins.git
cd dar-soins
git checkout feature/notifications-rapports-ia  # branche avec les nouvelles features

# Rendre exécutable le script d'installation
chmod +x install-v2.sh

# Lancer l'installation
./install-v2.sh
```

Le script `install-v2.sh` va :
1. Installer les dépendances backend (composer require laravel/reverb, pusher/pusher-php-server)
2. Publier les fichiers de config Reverb
3. Configurer le `.env` avec les variables Reverb
4. Exécuter les migrations + seeders (notifications, tâches de démo)
5. Installer les dépendances frontend (laravel-echo, pusher-js, recharts)
6. Créer le `.env` frontend avec les variables VITE_REVERB_*
7. Faire un build de test

### Démarrage

```bash
./start.sh
```

Démarre simultanément 4 services :
- ✅ API Laravel sur http://127.0.0.1:8000
- ✅ WebSocket Reverb sur ws://127.0.0.1:8080
- ✅ Queue worker (pour les notifications async)
- ✅ Frontend Vite sur http://localhost:5173

### Comptes de démo

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Gestionnaire (Admin) | admin@dar-soins.com | password |
| Client | client@dar-soins.com | password |
| Infirmier | infirmier@dar-soins.com | password |

---

## Architecture

```
dar-soins/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Console/Commands/
│   │   │   └── CheckStockAlertes.php   # Commande programmée (détection stock bas)
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── InterventionController.php  # wire notifications
│   │   │   │   ├── AchatController.php          # wire notifications paiement_recu
│   │   │   │   ├── NotificationController.php   # NOUVEAU v2
│   │   │   │   ├── NotifConfigController.php    # (existant, étendu)
│   │   │   │   ├── TacheController.php          # NOUVEAU v2
│   │   │   │   └── RapportController.php        # NOUVEAU v2 (Rapports & IA)
│   │   │   ├── Resources/
│   │   │   │   ├── NotificationResource.php    # NOUVEAU v2
│   │   │   │   └── TacheResource.php            # NOUVEAU v2
│   │   │   └── Requests/Tache/                  # NOUVEAU v2
│   │   ├── Models/
│   │   │   ├── User.php                  # étendu (receivesBroadcastNotificationsOn)
│   │   │   ├── Tache.php                 # NOUVEAU v2
│   │   │   └── NotifConfig.php           # étendu (helpers canalActif/destinataireInclus)
│   │   ├── Notifications/                # NOUVEAU v2 (8 classes)
│   │   │   ├── BaseNotification.php     # classe abstraite
│   │   │   ├── NouvelleInterventionNotification.php
│   │   │   ├── InfirmierAffecteNotification.php
│   │   │   ├── DevisAccepteNotification.php
│   │   │   ├── DevisRefuseNotification.php
│   │   │   ├── InterventionClotureeNotification.php
│   │   │   ├── PaiementRecuNotification.php
│   │   │   ├── StockAlerteNotification.php
│   │   │   └── NouveauClientNotification.php
│   │   └── Services/
│   │       ├── ServiceNotification.php   # NOUVEAU v2 (dispatcher central)
│   │       ├── ServiceTache.php          # NOUVEAU v2
│   │       └── ServiceRapport.php       # NOUVEAU v2 (avec IA intégrée)
│   ├── config/
│   │   ├── broadcasting.php              # NOUVEAU v2 (Reverb driver)
│   │   └── reverb.php                    # NOUVEAU v2
│   ├── database/
│   │   ├── migrations/
│   │   │   ├── ... (44 migrations v1)
│   │   │   ├── 2026_07_21_000001_create_notifications_table.php  # NOUVEAU v2
│   │   │   └── 2026_07_21_000002_create_taches_table.php          # NOUVEAU v2
│   │   ├── factories/
│   │   │   └── TacheFactory.php          # NOUVEAU v2
│   │   └── seeders/
│   │       ├── TacheSeeder.php           # NOUVEAU v2 (15 tâches de démo)
│   │       └── NotificationSeeder.php    # NOUVEAU v2
│   └── routes/
│       ├── api.php      # étendu avec /notifications, /taches, /planning, /rapports/*
│       ├── channels.php # NOUVEAU v2 (canaux privés User + presence)
│       └── console.php  # étendu (scheduler vérification stock)
│
├── frontend/                  # React SPA
│   └── src/
│       ├── context/
│       │   ├── AuthContext.jsx               # étendu (dispatch events login/logout)
│       │   └── NotificationContext.jsx       # NOUVEAU v2 (singleton Echo + state global)
│       ├── services/
│       │   ├── api.js                        # existant
│       │   └── echo.js                      # NOUVEAU v2 (config Laravel Echo)
│       ├── components/
│       │   ├── AdminLayout.jsx               # étendu (NotificationBell + Toasts)
│       │   └── notifications/                # NOUVEAU v2
│       │       ├── NotificationBell.jsx      # bell + dropdown
│       │       └── NotificationToasts.jsx    # toasts temps réel
│       └── pages/erp/
│           ├── NotificationsCentre.jsx       # NOUVEAU v2 (page complète)
│           ├── AiReports.jsx                 # NOUVEAU v2 (4 onglets IA)
│           ├── RapportStock.jsx              # refait v2 (Recharts)
│           ├── RapportVentes.jsx             # refait v2 (Recharts)
│           ├── RapportAchats.jsx              # refait v2 (Recharts)
│           ├── TachesList.jsx                # NOUVEAU v2 (Kanban + liste)
│           └── Calendrier.jsx                # NOUVEAU v2 (vue hebdo)
│
├── install-v2.sh             # Script d'installation v2
├── start.sh                  # Script de démarrage (étendu : Reverb + queue)
├── start.bat                 # Équivalent Windows (existant)
└── README.md                 # ce fichier
```

---

## API Endpoints (v2)

### Notifications (tous les utilisateurs authentifiés)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notifications` | Liste paginée des notifications |
| GET | `/api/notifications/unread` | Top 10 notifications non lues |
| GET | `/api/notifications/unread-count` | Compteur non lues (pour badge) |
| POST | `/api/notifications/{id}/mark-read` | Marquer comme lue |
| POST | `/api/notifications/mark-all-read` | Tout marquer comme lu |
| DELETE | `/api/notifications/{id}` | Supprimer une notification |
| DELETE | `/api/notifications/clear-read` | Supprimer toutes les lues |

### Tâches (Organisation)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/taches` | Liste paginée avec filtres (statut, priorité, catégorie, assigne_a) |
| POST | `/api/taches` | Créer une tâche |
| GET | `/api/taches/{id}` | Afficher une tâche |
| PUT | `/api/taches/{id}` | Mettre à jour (gère transitions statut auto) |
| DELETE | `/api/taches/{id}` | Supprimer (gestionnaire seulement) |
| GET | `/api/planning?semaine=2026-W28` | Vue planning hebdomadaire (tâches + interventions) |
| GET | `/api/organisation/stats` | Statistiques pour dashboard organisation |

### Rapports & IA (gestionnaire seulement)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/rapports/synthese` | Synthèse globale (KPIs + top produits + évolution 6 mois) |
| GET | `/api/rapports/stock` | Rapport stock (alertes, ruptures, valeur, par catégorie) |
| GET | `/api/rapports/ventes?from=&to=` | Rapport ventes (évolution + top produits) |
| GET | `/api/rapports/achats?from=&to=` | Rapport achats (statuts, fournisseurs) |
| GET | `/api/rapports/interventions?from=&to=` | Rapport interventions (par statut, top infirmiers) |
| GET | `/api/rapports/finances?from=&to=` | Rapport financier (revenus vs dépenses) |
| GET | `/api/rapports/ia/synthese` | Synthèse IA (langage naturel) |
| GET | `/api/rapports/ia/anomalies` | Détection d'anomalies |
| GET | `/api/rapports/ia/previsions` | Prévisions 30 jours |
| GET | `/api/rapports/ia/recommandations` | Recommandations stratégiques |
| GET | `/api/rapports/export/{type}` | Export JSON (PDF/Excel à configurer) |

### Configuration notifications (gestionnaire seulement)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notif-configs` | Liste des 8 événements configurables |
| PUT | `/api/notif-configs/{id}` | Modifier canaux (email/sms/app) + destinataires |
| PATCH | `/api/notif-configs/{id}/toggle` | Activer/désactiver un événement |

---

## Événements et notifications

Le système respecte strictement les configurations de `NotifConfig`. À chaque événement métier, le `ServiceNotification::dispatcher()` est appelé avec :

1. Le slug de l'événement (ex: `nouvelle_intervention`)
2. Le payload (le modèle concerné : Intervention, Devis, etc.)
3. Des options additionnelles (URL cible, destinataires extra)

Le service :
- Vérifie que l'événement est activé (`est_actif = true`)
- Résout les destinataires (rôles dans `destinataires[]` + extra du payload)
- Sélectionne les canaux activés (email, sms, app)
- Dispatche via `User::notify()` qui déclenche :
  - Stockage en base (canal `database`)
  - Diffusion temps réel sur WebSocket (canal `broadcast`)
  - Envoi email (canal `mail`)

### Mapping événement → trigger

| Slug | Trigger (controller@method) |
|------|------------------------------|
| `nouvelle_intervention` | `InterventionController@commanderSoin` |
| `infirmier_affecte` | `InterventionController@affecterManuellement` |
| `devis_accepte` | `InterventionController@repondreDevisClient` (branche accepte) |
| `devis_refuse` | `InterventionController@repondreDevisClient` (branche refuse) |
| `intervention_cloturee` | `InterventionController@cloturerIntervention` |
| `paiement_recu` | `AchatController@storePaiement` + `InterventionController@cloturerIntervention` |
| `stock_alerte` | Console command `darsoins:check-stock-alertes` (daily 08:00) |
| `nouveau_client` | `AuthController@register` (quand role = client) |

---

## Canaux WebSocket

Le backend définit 3 types de canaux dans `routes/channels.php` :

| Canal | Type | Autorisation |
|-------|------|--------------|
| `App.Models.User.{id}` | Privé | Uniquement l'utilisateur lui-même |
| `notifications.{userId}` | Privé | Uniquement l'utilisateur lui-même (utilisé par le frontend) |
| `presence.gestionnaires` | Présence | Uniquement les gestionnaires (online users) |
| `presence.infirmiers` | Présence | Infirmiers disponibles seulement |

---

## Commandes Artisan

```bash
# Vérification manuelle des stocks bas (déclenche les notifications stock_alerte)
php artisan darsoins:check-stock-alertes

# Démarrer le serveur Reverb
php artisan reverb:start --debug

# Lancer le worker de queue (pour notifications async)
php artisan queue:listen --tries=1

# Scheduler (à configurer en prod via cron)
php artisan schedule:run
```

---

## Sécurité

| Couche | Mécanisme |
|--------|-----------|
| Authentification | Sanctum (tokens Bearer) |
| Autorisation | Spatie Permissions (RBAC) |
| WebSocket | Canaux privés + auth Bearer token |
| Rate Limiting | 60 req/min (API), 5 req/min (Auth) |
| CORS | Restreint à FRONTEND_URL |
| Hash | bcrypt (mots de passe) |

---

## Tests

```bash
# Backend (Pest PHP)
cd backend
composer test

# Frontend (à venir)
cd frontend
npm test
```

---

## Roadmap v3

- [ ] Notifications SMS via passerelle Marocaine (ex: SMS Gateway Maroc)
- [ ] Notifications push mobile (PWA)
- [ ] Export PDF/Excel via maatwebsite/excel
- [ ] Authentification 2FA pour gestionnaires
- [ ] Module RH complet (paie, congés, présences)
- [ ] Module Comptabilité complet
- [ ] Application mobile native (React Native)

---

## Changelog

| Version | Date | Changements |
|---------|------|-------------|
| v1.0.0 | 2026-05-21 | Initial release |
| v1.1.0 | 2026-05-22 | PostgreSQL, Redis, Docker, API Resources |
| v1.2.0 | 2026-06-15 | ERP complet (achats, ventes, retours, paiements) |
| **v2.0.0** | **2026-07-21** | **Notifications temps réel (Reverb), Rapports IA, Module Organisation** |

---

## Contact

- **Dar-Soins Maroc**
- Email: contact@darsoins.ma
- Site: https://darsoins.ma

---

*Développé avec ❤️ au Maroc*