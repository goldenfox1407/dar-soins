# 📋 HISTORIQUE DÉTAILLÉ DES OPÉRATIONS & DÉVELOPPEMENTS — DAR-SOINS ERP

> **Projet** : DAR-SOINS — Plateforme & ERP de Gestion de Soins Médicaux et Garde Infirmière à Domicile  
> **Cadre Académique** : Projet de Fin de Formation (PFF) / Licence Professionnelle en Développement Web & Sécurité — **IFIAG Maroc**  
> **Auteur** : Équipe de Développement & Sécurité DAR-SOINS  
> **Dépôt GitHub** : `https://github.com/goldenfox1407/dar-soins.git` (Branche `master`)  
> **Dernière mise à jour** : 15 Août 2026

---

## 📑 TABLE DES MATIÈRES
1. [Contexte et Architecture du Projet](#1-contexte-et-architecture-du-projet)
2. [Chronologie des Grandes Phases de Développement](#2-chronologie-des-grandes-phases-de-développement)
3. [Détail Exhaustif des Modules Opérationnels](#3-détail-exhaustif-des-modules-opérationnels)
   - [3.1 Authentification, Utilisateurs & Sécurité RBAC](#31-authentification-utilisateurs--sécurité-rbac)
   - [3.2 Contacts & Gens (Clients & Fournisseurs)](#32-contacts--gens-clients--fournisseurs)
   - [3.3 Produits, Consommables & Services Médicaux](#33-produits-consommables--services-médicaux)
   - [3.4 Gestion des Stocks (Ajustements & Transferts)](#34-gestion-des-stocks-ajustements--transferts)
   - [3.5 Achats Fournisseurs & Retours d'Achat](#35-achats-fournisseurs--retours-dachat)
   - [3.6 Ventes, Devis Médicaux & Facturation](#36-ventes-devis-médicaux--facturation)
   - [3.7 Ressources Humaines (Employés, Présences, Congés, Paie)](#37-ressources-humaines-employés-présences-congés-paie)
   - [3.8 Contrats de Garde Médicale & Protocoles Juridiques](#38-contrats-de-garde-médicale--protocoles-juridiques)
   - [3.9 Paramètres Système & Notifications Temps Réel](#39-paramètres-système--notifications-temps-réel)
4. [Harmonisation Graphique, Modales & Moteur PDF](#4-harmonisation-graphique-modales--moteur-pdf)
5. [Journal Chronologique des Commits Git](#5-journal-chronologique-des-commits-git)
6. [Conclusion & État d'Avancement](#6-conclusion--état-davancement)

---

## 1. Contexte et Architecture du Projet

Le projet **DAR-SOINS** est une solution complète combinant un portail client/patient, un espace professionnel pour les infirmiers(ères) et un **ERP de gestion hospitalière et administrative** pour le gestionnaire.

### 🛠️ Stack Technologique :
- **Backend** : Laravel 11 / PHP 8.2+, API RESTful, PostgreSQL, Spatie Laravel-Permission (RBAC), Laravel Sanctum (Tokens d'authentification Bearer), Barryvdh DomPDF (Génération PDF serveur).
- **Frontend** : React 18, Vite 8, React Router v6, TailwindCSS & Vanilla CSS personnalisé (Design System Glassmorphism & Modern Dark/Light), Lucide React (Iconographie vectorielle).
- **Sécurité** : Protection contre les vulnérabilités OWASP Top 10, hachage bcrypt, validation stricte des requêtes (`FormRequest`), transactions atomiques SQL (`DB::transaction`).

---

## 2. Chronologie des Grandes Phases de Développement

| Date | Phase / Milestone | Objectif Principal | Statut |
| :--- | :--- | :--- | :--- |
| **02/07/2026** | **Phase 1 : Fondations ERP & UI Base** | Initialisation backend Laravel + frontend React, intégration de la structure ERP de base. | ✅ Terminé |
| **03/07/2026 - 06/07/2026** | **Phase 2 : Achats & Entrepôts** | Gestion des achats, multi-entrepôts, paiements et documents fournisseurs. | ✅ Terminé |
| **14/07/2026 - 21/07/2026** | **Phase 3 : Devis, Factures & Logos** | Moteur de devis/factures PDF avec charte officielle et support de présentation PFE. | ✅ Terminé |
| **12/08/2026 - 13/08/2026** | **Phase 4 : Gestion de Stock, Notifications & HRM** | Modules Ajustements/Transferts, Notifications in-app temps réel, module RH complet. | ✅ Terminé |
| **13/08/2026** | **Phase 5 : Canva AI Pitch Deck PFF** | Script de soutenance académique 18 diapositives pour la Licence Pro IFIAG. | ✅ Terminé |
| **15/08/2026** | **Phase 6 : Contrats de Garde Médicale** | Implémentation intégrale des contrats de garde, 5 cas cliniques, clauses juridiques et PDF officiel. | ✅ Terminé |
| **15/08/2026** | **Phase 7 : Module Retour d'Achat** | Implémentation du module Retour d'Achat complet avec réconciliation des stocks et bon de retour PDF. | ✅ Terminé |

---

## 3. Détail Exhaustif des Modules Opérationnels

### 3.1 Authentification, Utilisateurs & Sécurité RBAC
- **Gestion des Utilisateurs** (`/gestionnaire/utilisateurs`) : Création, modification, assignation de rôles (`admin`, `gestionnaire`, `infirmier`, `client`).
- **Matrice des Rôles & Permissions** (`/gestionnaire/roles`, `/gestionnaire/permissions`) : Contrôle d'accès basé sur Spatie Permissions avec matrice granulaire par module.
- **Résolution des conflits d'URL & Réseau** : Configuration de l'intercepteur Axios avec fallback automatique sur `127.0.0.1:8000`.

### 3.2 Contacts & Gens (Clients & Fournisseurs)
- **Gestion des Clients / Patients** (`/gestionnaire/gens/clients`) : Fiches complètes avec historique des actes, adresses géolocalisées, contacts d'urgence.
- **Gestion des Fournisseurs** (`/gestionnaire/gens/fournisseurs`) : Répertoire des laboratoires, distributeurs de matériel médical et grossistes pharmaceutiques.

### 3.3 Produits, Consommables & Services Médicaux
- **Catalogue & CRUD Produits** (`/gestionnaire/produits`, `/gestionnaire/produits/create`) : Distinction entre actes de soins, consommables et forfaits de garde.
- **Paramétrages Produits** : Catégories, Marques, Unités de mesure, Unités de base, Variations et Générateur/Imprimeur de codes-barres (`/gestionnaire/produits/code-barres`).

### 3.4 Gestion des Stocks (Ajustements & Transferts)
- **Ajustements de Stock** (`/gestionnaire/ajustements`, `/gestionnaire/ajustements/ajouter`) :
  - Ajustements positifs (Entrée / Surplus / Correction inventaire).
  - Ajustements négatifs (Sortie / Perte / Périmé / Endommagé).
  - Impact direct et atomique sur la table pivot `produit_entrepot`.
- **Transferts de Stock** (`/gestionnaire/transferts`, `/gestionnaire/transferts/ajouter`) :
  - Mouvement de consommables entre entrepôts (ex: Dépôt Central Rabat ➔ Dépôt Casablanca).
  - Déduction sur l'entrepôt source et incrémentation sur l'entrepôt cible.

### 3.5 Achats Fournisseurs & Retours d'Achat
- **Commandes d'Achats** (`/gestionnaire/achats`, `/gestionnaire/achats/ajouter`) :
  - Saisie des bons de commande fournisseurs avec calcul automatique des taxes et remises.
  - Suivi des réceptions de marchandises et historique des paiements.
- **Module Retour d'Achat** (`/gestionnaire/retours/achats`, `/gestionnaire/retours/achats/ajouter`) :
  - *Nouveau !* Création de retours de marchandises basés sur des commandes d'achats existantes.
  - Déduction automatique des articles retournés du stock de l'entrepôt assigné.
  - Génération du **Bon de Retour Officiel PDF** reprenant le logo, les mentions légales, le détail des articles et le cachet d'entreprise.

### 3.6 Ventes, Devis Médicaux & Facturation
- **Devis Médicaux** (`/gestionnaire/devis`) :
  - Émission de devis de soins avec tarification kilométrique et actes infirmiers.
  - Exportation PDF conforme avec liseré dégradé, coordonnées de l'établissement et mentions légales.
- **Retour des Ventes** (`/gestionnaire/retours/ventes`, `/gestionnaire/retours/ventes/ajouter`) :
  - Enregistrement des retours clients et réintégration automatique des produits dans l'entrepôt.

### 3.7 Ressources Humaines (Employés, Présences, Congés, Paie)
- **Employés** (`/gestionnaire/hrm/employes`) :
  - Liaison directe avec les comptes utilisateurs.
  - Distinction essentielle des infirmiers : **Infirmier des soins (Rémunération par acte)** vs **Infirmier des gardes (Salarié mensuel fixe)**.
- **Pointage & Présences** (`/gestionnaire/hrm/presences`) : Suivi des heures travaillées, retards et heures supplémentaires.
- **Gestion des Congés** (`/gestionnaire/hrm/conges`) : Workflow de demande, validation/rejet et décompte du solde.
- **Fiches de Paie** (`/gestionnaire/hrm/paie`) :
  - Calcul du salaire net (Salaire de base + Commissions par acte + Primes - Déductions CNSS/AMO/IR).
  - Génération de la fiche de paie imprimable et téléchargeable.

### 3.8 Contrats de Garde Médicale & Protocoles Juridiques
- **Restructuration du Menu** : Remplacement de *Services & Contrats* par le menu spécialisé **« Contrats de Garde »** (`/gestionnaire/contrats`).
- **5 Cas de Garde Clinique Spécialisés** :
  1. 🌙 **Garde de Nuit (20h - 08h)** : Surveillance nocturne continue, constantes à 22h/02h/06h, protocole d'urgence SAMU 141, tarif 450 MAD/jour.
  2. ☀️ **Garde de Jour (08h - 20h)** : Soins d'hygiène, pansements, surveillance nutritionnelle, tarif 400 MAD/jour.
  3. ⏳ **Garde Continue 24h/24** : Binôme en roulement 2 soignants, transmissions écrites obligatoires, garantie de remplacement < 2h, tarif 900 MAD/jour.
  4. 🏥 **Soins Post-opératoires Intensifs** : Gestion des drains Redon, EVA douleur, injections anticoagulants HBPM, tarif 550 MAD/jour.
  5. 👵 **Accompagnement Senior Dépendance** : Prévention des chutes, pilulier sécurisé, stimulation cognitive, tarif 350 MAD/jour.
- **Clauses Prêtes à l'Emploi** : Articles juridiques 1 à 5 pré-remplis automatiquement lors du choix du cas de garde.
- **Bouton PDF par ligne & Cachet Direction** : Impression immédiate au format officiel A4 avec le cachet de la société placé dans le cartouche *« Pour la Direction DAR-SOINS »*.

### 3.9 Paramètres Système & Notifications Temps Réel
- **Paramétrage Global** (`/gestionnaire/parametres/*`) : Configuration système, taxes (TVA 20%), devises (MAD par défaut), entrepôts, numérotation séquentielle des pièces.
- **Centre de Notifications** (`NotificationDropdown.jsx`) : Système de toasts et dropdown en temps réel notifiant les nouvelles commandes, alertes de stock bas et retours.

---

## 4. Harmonisation Graphique, Modales & Moteur PDF

1. **Architecture des Popups & Modales (`createPortal`)** :
   - Migration de toutes les fenêtres modales ERP vers `createPortal(..., document.body)`.
   - Application d'un décalage supérieur sécurisé `padding: 70px 16px 40px 16px` et `overflowY: 'auto'` évitant tout masquage par la barre de navigation.
2. **Standardisation des Documents PDF (Devis, Factures, Contrats, Retours)** :
   - En-tête avec logo HD DAR-SOINS (`contract_assets.json` en Base64 offline-ready).
   - Liseré tricolore en dégradé `#2563EB` vers `#10B981`.
   - Cartouches d'identification des parties avec entête bleu royal.
   - Tableaux à largeur fixe 100% avec gestion du retour automatique à la ligne (`overflow-wrap: break-word`).
   - Blocs de signatures officiels avec **Cachet et Visa de la Société** apposé pour la direction.
   - Mentions d'immatriculation légale en pied de page : **RC 148529 — IF 45892154 — ICE 002589632000045 — Patente 35896412**.

---

## 5. Journal Chronologique des Commits Git

```
34793ea - 2026-08-15 : feat(achats): implementer completement le module Retour d'Achat avec gestion de stock et impression de bon de retour PDF officiel
d6d533c - 2026-08-15 : fix(contrats): positionner le cachet de la societe a l'interieur de la rubrique POUR LA DIRECTION DAR-SOINS
a98aac2 - 2026-08-15 : feat(contrats): harmoniser le design PDF du contrat sur le style officiel du devis et de la facture avec logo et cachet de l'entreprise
108de15 - 2026-08-15 : fix(contrats): corriger le chargement des listes de clients et infirmiers dans le formulaire de contrat
ea31189 - 2026-08-15 : fix(pdf): corriger la mise en page et l'alignement strict A4 du document PDF
92e63c8 - 2026-08-15 : feat(contrats): ajouter le bouton direct de generation et visualisation PDF dans chaque ligne du tableau
3f1399e - 2026-08-15 : feat(contrats): integrer les clauses juridiques et protocoles medicaux prets a l'emploi par cas de garde
8fc7ca2 - 2026-08-15 : fix(ui): ajuster le positionnement du popup modal (70px top padding, ReactPortal et max-height)
ae696c4 - 2026-08-15 : feat(contrats): implementer le module complet contrats de garde medicale et restructurer les menus
67f3e53 - 2026-08-15 : fix(menu): supprimer le menu comptabilite et ses sous-menus (comptes, depots, depenses, transferts)
eec4d02 - 2026-08-13 : feat(hrm): implementer le module ressources humaines complet (employes lies aux utilisateurs, mode salarie/par acte, presences, conges, paie)
361e969 - 2026-08-13 : feat(retours): implementer le module complet retour des ventes (liste, creation, réintégration stock)
946175f - 2026-08-13 : fix(menu): renommer le sous-menu retours ventes en retour des ventes
dc89554 - 2026-08-13 : feat(stock): implementer le module de gestion de stock avec ajustements et transferts
6433937 - 2026-08-13 : fix(notifications): utiliser React Portal pour le popup toast et filtrer les anciennes notifications
1490bbb - 2026-08-13 : style(notifications): ajuster la position du popup et du dropdown vers le bas de 10%
c979385 - 2026-08-13 : feat(notifications): implementer le systeme de notification in-app en temps reel et la page de configuration riche
b239119 - 2026-08-13 : feat(produits): implementer la page d'edition complete des produits et services
bc1fe41 - 2026-08-13 : fix(users): corriger l'import de MapIcon dans UtilisateursList pour resoudre l'ecran blanc lors de la modification
7b3b9f3 - 2026-08-13 : fix(seeder,auth): rendre DatabaseSeeder idempotent et corriger la configuration VITE_API_URL avec fallback
14711d3 - 2026-08-12 : fix: start.bat auto-init PostgreSQL + seeder idempotent
268592e - 2026-08-12 : fix: start.bat - utiliser pushd/popd et call pour execution complete
ce9e1e5 - 2026-08-12 : Ajout installation automatique des dependances dans start.bat
4aa5e4b - 2026-07-21 : feat: logo unifie, PDF devis/facture, dashboards auto-refresh, historique interventions, presentation PFE PowerPoint 32 diapos
3801d2e - 2026-07-14 : feat: global erp visual alignment, database autoconfig scripts and local startup files
03c01dc - 2026-07-06 : feat: complete stocky clone for achats, returns, and payments
d260d51 - 2026-07-03 : Add resolution modifications walkthrough document
10bcf79 - 2026-07-03 : Resolve port conflict and localhost IPv6 resolution issue on Windows by switching api.js and frontend references to 127.0.0.1
68a19f3 - 2026-07-02 : Convert VenteDetailsModal to premium dark theme
1bcc001 - 2026-07-02 : Add tweaks modifications walkthrough document
7e0a2cb - 2026-07-02 : Fix AdminLayout hamburger collapse folding bug and convert VentesList to premium dark theme
b008019 - 2026-07-02 : Add ERP modifications walkthrough document
fbb5b56 - 2026-07-02 : Implement Purchases (Achats) and Warehouses (Entrepots) CRUD functionality in ERP
447c6f0 - 2026-07-02 : Rename CHANGEMENTS_UI.md to include precise date and time of modifications
25e667f - 2026-07-02 : Add project, technical, and code plan explanation document
d721ae6 - 2026-07-02 : Upgrade AdminDashboard UI and fix backend PersonnelController relationship bug
91e6210 - 2026-07-02 : consulte CHANGEMENTS_UI.md pour les changement de 02-07-26/18:58
a94b289 - 2026-07-02 : Initial commit: projet dar-soins (backend Laravel + frontend React)
```

---

## 6. Conclusion & État d'Avancement

Le système **DAR-SOINS ERP** est à présent dans un état de maturité robuste :
- **Intégrité des Données** : Toutes les opérations sensibles (mouvements de stock, créations de contrats, calculs de paie, ajustements et retours) s'exécutent au sein de transactions ACID garanties.
- **Documents Commerciaux et Médicaux Unifiés** : Tous les documents imprimables (Devis, Factures, Fiches de Paie, Contrats de Garde, Bons de Retour d'Achat) partagent une charte visuelle d'élite, professionnelle et conforme aux normes marocaines.
- **Prêt pour la Soutenance PFF** : Le projet répond rigoureusement aux exigences académiques et techniques de la Licence Professionnelle en Développement et Sécurité Web/Logiciel à l'IFIAG.

---
*Document généré et versionné automatiquement dans le référentiel de code source DAR-SOINS.*
