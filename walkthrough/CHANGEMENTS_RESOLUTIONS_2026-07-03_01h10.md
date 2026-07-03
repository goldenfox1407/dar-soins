# 🚀 Rapport de Modification — Résolution de Connexion API (127.0.0.1 vs Localhost)

**Date & Heure précise du changement** : `2026-07-03T01:10:00+01:00`  
**Auteur** : Antigravity Coding Assistant  
**Objectif** : Résolution du conflit de port et du problème de résolution DNS locale sur Windows pour permettre la connexion aux comptes démo.

---

## 🛠️ Modifications Réalisées

### 1. Correction de la Base URL de l'API

*   **[api.js](file:///c:/Users/genjo/Documents/opencode/dar-soins/frontend/src/services/api.js)** :
    *   Remplacement de `http://localhost:8000/api` par `http://127.0.0.1:8000/api`.
    *   **Pourquoi ?** : Sous Windows, `localhost` résout par défaut vers l'adresse IPv6 `[::1]`. Sur cette adresse, le service OpenHands (workspace agent) était actif sur le port 8000, tandis que l'API Laravel tournait sur l'adresse IPv4 `127.0.0.1:8000`. Cela provoquait des erreurs silencieuses de routage et des échecs de connexion systématiques avec l'erreur "Identifiants incorrects".

### 2. Correction des URLs hardcodées dans le Frontend

*   **[AdminDashboard.jsx](file:///c:/Users/genjo/Documents/opencode/dar-soins/frontend/src/pages/AdminDashboard.jsx)** :
    *   Mise à jour de `BACKEND_URL` pour utiliser `http://127.0.0.1:8000/storage/` au lieu de `localhost`.
    *   Mise à jour du lien de téléchargement des factures PDF pour pointer vers `http://127.0.0.1:8000/api/factures/`.
*   **[Services.jsx](file:///c:/Users/genjo/Documents/opencode/dar-soins/frontend/src/pages/Services.jsx)** :
    *   Mise à jour des images de produits pour pointer vers `http://127.0.0.1:8000/storage/`.
*   **[UtilisateursList.jsx](file:///c:/Users/genjo/Documents/opencode/dar-soins/frontend/src/pages/erp/UtilisateursList.jsx)** :
    *   Mise à jour des liens et images de documents d'identité (CIN recto, verso, diplôme) des infirmiers vers `http://127.0.0.1:8000/storage/`.
*   **[VenteDetailsModal.jsx](file:///c:/Users/genjo/Documents/opencode/dar-soins/frontend/src/pages/erp/VenteDetailsModal.jsx)** :
    *   Mise à jour du lien de consultation des ordonnances jointes vers `http://127.0.0.1:8000/storage/`.

### 3. Réinitialisation Sécurisée des Mots de Passe Démo

*   Exécution d'un script de maintenance temporaire pour garantir que les comptes de test (`admin@dar-soins.com`, `client@dar-soins.com`, `infirmier@dar-soins.com`) sont bien configurés avec le mot de passe par défaut : `password`.

---

## 🧪 Validation & Tests

1.  **Test de connexion** : Validé avec succès. Les requêtes réseau s'orientent désormais directement vers la boucle locale IPv4 (`127.0.0.1`), contournant le serveur OpenHands et atteignant correctement l'API Laravel.
2.  **Mise en ligne** : Les fichiers ont été poussés avec succès sur le dépôt GitHub.
