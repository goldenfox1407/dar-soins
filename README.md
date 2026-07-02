# Dar-Soins Maroc — Plateforme de Soins Infirmiers à Domicile

## Stack Technologique

### Backend
- **PHP 8.2+**
- **Laravel 12**
- **PostgreSQL 15**
- **Redis 7**
- **Laravel Sanctum** (Authentification)
- **Spatie Permissions** (RBAC)
- **Laravel Pint** (Formattage)
- **DomPDF** (Génération PDF)

### Frontend
- **React 19**
- **Vite 5**
- **React Router v6**
- **Axios**
- **Tailwind CSS** (Design System Glassmorphism)

### DevOps
- **Docker & Docker Compose**
- **Nginx** (Reverse Proxy)
- **CI/CD GitHub Actions**

## Architecture

```
dar-soins/
├── backend/                  # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/  # Auth, Produit, Intervention, Facture
│   │   │   └── Resources/    # API Resources ( transformation sécurisée)
│   │   ├── Models/           # User, Produit, Intervention, etc.
│   │   ├── Services/         # ServiceAffectation, ServiceTarification, ServiceGeolocalisation, CacheService
│   │   └── Providers/        # AppServiceProvider (Redis, Cache)
│   ├── database/
│   │   └── migrations/       # 19 tables (users, produits, interventions, etc.)
│   ├── tests/
│   │   └── Feature/           # Tests Pest (Auth, Produit, Intervention)
│   ├── Dockerfile
│   └── Dockerfile.prod
│
├── frontend/                  # React SPA
│   ├── src/
│   │   ├── pages/             # Home, Services, Login, Dashboards
│   │   └── services/          # api.js (Axios + intercepteurs)
│   ├── Dockerfile
│   └── nginx.conf
│
├── docker-compose.yml         # Développement
└── docker-compose.prod.yml    # Production
```

## Architecture

```
┌──────────────────┐
│    Client SPA    │  React + Vite (localhost:5173)
│                  │
│  / (Home)        │
│  /services       │
│  /login          │
│  /client/*       │
│  /infirmier/*    │
│  /gestionnaire/* │
└────────┬─────────┘
         │ HTTP/JSON (Axios)
         │ Authorization: Bearer {token}
         ▼
┌──────────────────┐
│   Laravel API    │  PHP 8.2 + Laravel 12 (localhost:8000)
│                  │
│  Routes (api.php)│
│  Controllers     │
│  API Resources   │
│  Services        │
│  Models (Eloquent)│
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│PostgreSQL│ │  Redis  │
│   15    │ │   7     │
└─────────┘ └─────────┘
```

## Installation & Démarrage

### Pré-requis
- Docker & Docker Compose
- Node.js 20+
- PHP 8.2+

### Développement (Docker)

```bash
# Cloner le projet
git clone https://github.com/votre-repo/dar-soins.git
cd dar-soins

# Lancer tous les services
docker-compose -f docker-compose.yml up -d

# Backend
# http://localhost:8000
# Frontend
# http://localhost:5173
```

### Production (Docker)

```bash
# Définir les variables d'environnement
cp .env.example .env
# Modifier APP_KEY, DB_PASSWORD, etc.

# Lancer en production
docker-compose -f docker-compose.prod.yml up -d
```

### Sans Docker (Développement local)

**Backend:**
```bash
cd backend
composer install
cp .env.example .env  # Configurer DB, Redis, etc.
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Sécurité

| Couche | Mécanisme |
|--------|-----------|
| Authentification | Sanctum (tokens) |
| Autorisation | Spatie Permissions (RBAC) |
| Rate Limiting | 60 req/min (API), 5 req/min (Auth) |
| CORS | Restreint à localhost:5173 |
| Hash | bcrypt (mots de passe) |
| Cache | Redis (données sensibles) |

## Tests

```bash
# Backend (Pest PHP)
cd backend
composer test

# Frontend (Jest)
cd frontend
npm test
```

## Rôles & Permissions

| Rôle | Permissions |
|------|-------------|
| **Client** | Commander soins, consulter devis/factures |
| **Infirmier** | Recevoir missions, clôturer interventions |
| **Gestionnaire** | CRUD produits, personnel, finances |

## API Endpoints

### Public
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/register` | Inscription |
| POST | `/api/login` | Connexion |
| GET | `/api/produits` | Liste produits |

### Authentifié (Bearer Token)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/user` | Profil utilisateur |
| POST | `/api/produits` | Créer produit (Admin) |
| PUT | `/api/produits/{id}` | Modifier produit (Admin) |
| DELETE | `/api/produits/{id}` | Supprimer produit (Admin) |
| POST | `/api/interventions/commander` | Commander soin |
| POST | `/api/interventions/{id}/cloturer` | Clôturer intervention |
| GET | `/api/factures` | Liste factures |
| GET | `/api/factures/{id}/pdf` | Télécharger PDF |
| GET | `/api/personnel` | Liste personnels |

## Changelog

| Version | Date | Changements |
|---------|------|-------------|
| v1.0.0 | 2026-05-21 | Initial release |
| v1.1.0 | 2026-05-22 | PostgreSQL, Redis, Docker, API Resources |

## Contact

- **Dar-Soins Maroc**
- Email: contact@darsoins.ma
- Site: https://darsoins.ma

---

*Développé avec ❤️ au Maroc*