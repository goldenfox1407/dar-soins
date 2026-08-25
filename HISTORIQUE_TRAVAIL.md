# 📋 HISTORIQUE COMPLET ET DÉTAILLÉ DU TRAVAIL RÉALISÉ — DAR-SOINS ERP

> **Projet** : DAR-SOINS — Plateforme Web & ERP Médical de Gestion de Soins et Garde Infirmière à Domicile  
> **Cadre** : Projet Professionnel & Académique de Fin de Formation (PFF / Licence Pro) — **IFIAG Maroc**  
> **Dépôt GitHub** : `https://github.com/goldenfox1407/dar-soins.git` (Branche : `master`)  
> **Date de dernière mise à jour** : 25 Août 2026  
> **État du projet** : 100% Fonctionnel, Optimisé et Déployé sur GitHub

---

## 📑 TABLE DES MATIÈRES

1. [Vue d'Ensemble du Projet & Architecture Technique](#1-vue-densemble-du-projet--architecture-technique)
2. [Synthèse Chronologique des Jalons (Milestones)](#2-synthèse-chronologique-des-jalons-milestones)
3. [Détail Exhaustif des Modules Implémentés](#3-détail-exhaustif-des-modules-implémentés)
   - [3.1 Authentification, RBAC & Sécurité](#31-authentification-rbac--sécurité)
   - [3.2 Cœur Médical : Interventions, Soins & Gardes](#32-cœur-médical--interventions-soins--gardes)
   - [3.3 Moteur de Devis, Facturation & Impression PDF Officielle](#33-moteur-de-devis-facturation--impression-pdf-officielle)
   - [3.4 Contrats de Garde Médicale & Protocoles Juridiques](#34-contrats-de-garde-médicale--protocoles-juridiques)
   - [3.5 Catalogue Produits, Services & Gestion des Stocks](#35-catalogue-produits-services--gestion-des-stocks)
   - [3.6 Achats Fournisseurs, Ventes & Gestion des Retours](#36-achats-fournisseurs-ventes--gestion-des-retours)
   - [3.7 Module Ressources Humaines (RH / HRM)](#37-module-ressources-humaines-rh--hrm)
   - [3.8 Rapports Décisionnels, Analytics & Intelligence Artificielle](#38-rapports-décisionnels-analytics--intelligence-artificielle)
   - [3.9 Organisation, Calendrier Interactif & Gestion des Tâches](#39-organisation-calendrier-interactif--gestion-des-tâches)
   - [3.10 Système de Notifications Temps Réel & Paramétrage](#310-système-de-notifications-temps-réel--paramétrage)
4. [Optimisation Majeure de la Base de Données (62 → 55 Tables)](#4-optimisation-majeure-de-la-base-de-données-62--55-tables)
5. [Performances, Code-Splitting & Expérience Utilisateur (UI/UX)](#5-performances-code-splitting--expérience-utilisateur-uiux)
6. [Journal Complet des Commits Git](#6-journal-complet-des-commits-git)
7. [Bilan et Livrables](#7-bilan-et-livrables)

---

## 1. Vue d'Ensemble du Projet & Architecture Technique

**DAR-SOINS** est une solution numérique intégrée dédiée aux soins infirmiers et à la garde médicale à domicile, combinant 3 interfaces unifiées :
1. **Le Portail Client / Patient** : Commande de soins géolocalisés, suivi en direct, signature tactile, historique des interventions, consultation des devis et factures.
2. **L'Espace Infirmier / Soignant** : Réception des missions, géolocalisation sur carte interactive Leaflet, prise des constantes vitales (tension, glycémie, température, poids), déclaration des consommables, encaissement et clôture d'intervention.
3. **L'ERP Gestionnaire / Direction** : Pilotage global, dispatching intelligent, facturation, contrats juridiques, gestion commerciale (achats/ventes/stocks), gestion RH (paie, congés, pointage), rapports analytiques et IA décisionnelle.

### 🛠️ Technologies Clés :
- **Backend** : Laravel 11 / PHP 8.2+, Architecture API RESTful, PostgreSQL, Spatie Laravel-Permission (RBAC), Laravel Sanctum (Tokens Bearer), DomPDF (Génération PDF serveur vectoriel).
- **Frontend** : React 18, Vite 8, React Router v6, React-Leaflet & OpenStreetMap, Recharts (Visualisation graphique), Lucide React (Iconographie), React Signature Canvas.
- **Sécurité** : Protection contre les failles OWASP Top 10, hachage bcrypt, `FormRequest` avec validation stricte, transactions SQL atomiques (`DB::transaction`).

---

## 2. Synthèse Chronologique des Jalons (Milestones)

| Date | Phase | Description du Jalon | Résultat |
|:---|:---|:---|:---|
| **02/07 - 10/07/2026** | **Phase 1 : Socle ERP & Achats** | Mise en place de l'ERP de base, gestion multi-entrepôts, achats fournisseurs et catalogue. | ✅ Validé |
| **14/07 - 21/07/2026** | **Phase 2 : Devis, Factures & Portails** | Première version des devis/factures PDF, portails patient et soignant, présentation PFE. | ✅ Validé |
| **12/08 - 14/08/2026** | **Phase 3 : Stock, HRM & Notifs** | Ajustements/transferts de stock, module RH complet (paie, congés, présences), notifications in-app. | ✅ Validé |
| **15/08/2026** | **Phase 4 : Contrats & Retours** | Contrats de garde avec 5 protocoles médicaux/juridiques, module complet de retours d'achat/vente. | ✅ Validé |
| **18/08 - 19/08/2026** | **Phase 5 : Rapports IA & Calendrier** | 5 pages de rapports financiers/stock/commissions avec filtres dates, calendrier des gardes, tâches. | ✅ Validé |
| **20/08 - 22/08/2026** | **Phase 6 : Moteur PDF & Optimisation** | Rendu PDF 10x plus rapide, clean ASCII, plein écran A4 strict, barre verte basse 0px, cachet et signature agrandis. | ✅ Validé |
| **22/08/2026** | **Phase 7 : Refactoring DB (62 → 55)** | Fusion et suppression des 7 tables redondantes dans PostgreSQL, 0 régression, modélisation UML. | ✅ Validé |

---

## 3. Détail Exhaustif des Modules Implémentés

### 3.1 Authentification, RBAC & Sécurité
- **Authentification Sanctum** : Connexion, inscription et gestion des sessions sécurisées avec tokens d'authentification Bearer.
- **Gestion des Utilisateurs** (`/gestionnaire/utilisateurs`) : CRUD complet des utilisateurs, attribution de rôles, activation/désactivation.
- **Matrice des Rôles & Permissions** (`/gestionnaire/roles`, `/gestionnaire/permissions`) : Pilotage fin basé sur **Spatie Laravel-Permission**. Les rôles `client`, `infirmier`, `gestionnaire` sont strictement cloisonnés.
- **Sécurisation des requêtes** : Intercepteur Axios avec gestion des erreurs 401/403 et fallback automatique sur l'URL d'API.

### 3.2 Cœur Médical : Interventions, Soins & Gardes
- **Commande de soin géolocalisée** : Formulaire interactif permettant au patient de choisir un acte de soin, d'uploader une ordonnance/fichier et de pointer sa position GPS exacte.
- **Algorithme d'affectation intelligente** : Calcul de la distance géodésique en kilomètres entre la position du patient et les infirmiers disponibles via `ServiceGeolocalisation`.
- **Espace Infirmier en direct** :
  - Notification instantanée de nouvelle mission avec carte GPS du patient.
  - Possibilité d'accepter ou de refuser (le refus réassigne automatiquement au soignant suivant).
  - Validation de l'arrivée sur site avec horodatage.
  - Saisie des constantes vitales (Tension artérielle, Glycémie, Température corporelle, Poids).
  - Déclaration des consommables utilisés.
  - Signature manuscrite tactile du patient sur canvas numérique.
  - Choix du mode de règlement (Espèces, Chèque, Virement) et enregistrement du montant reçu.

### 3.3 Moteur de Devis, Facturation & Impression PDF Officielle
- **Calculs de tarification exacts** :
  - Prix de l'acte de soin + Frais de déplacement calculés au km + Coût des consommables médicaux.
  - Calcul de TVA configurable (20% par défaut) avec montant Hors Taxe (HT), TVA et Total Toutes Taxes Comprises (TTC).
  - Conversion automatique du total en lettres en français (ex: *Trois cent soixante dirhams*).
- **Rendu DomPDF Ultra-Performant & Esthétique** :
  - **Mise en page Plein Format A4 Strict** : Élimination des sauts de page inutiles (tout tient sur 1 seule page A4 propre).
  - **Barre supérieure dégradée bleue** et **Barre inférieure verte bord-à-bord (`position: fixed; bottom: 0px`)**.
  - **Encodage Clean ASCII** : Suppression des symboles Unicode problématiques (évite l'apparition de `?` à l'impression).
  - **Visibilité maximale des signatures** : Agrandissement substantiel du bloc *Signature du Client* et du bloc *Cachet & Visa de la Direction*.
  - **Statut de paiement dynamique** : Affiche automatiquement le badge *"Payé"* en vert avec date lorsque la facture est soldée.
  - **Vitesse de rendu** : Optimisation x10 (passage de 8-10 secondes à ~1 seconde par document).

### 3.4 Contrats de Garde Médicale & Protocoles Juridiques
- **Module Contrats** (`/gestionnaire/contrats`, `/gestionnaire/contrats/ajouter`) :
  - Création de contrats de garde longue durée (Garde 24h/24, Garde de Nuit 12h, Garde de Jour 12h, Soins Palliatifs, Soins Post-Opératoires).
  - Génération automatique des références uniques (ex: `CTR-2026-0001`).
  - **5 modèles de clauses juridiques & protocoles médicaux intégrés** pré-remplis en un clic selon la pathologie du patient.
  - Visualisation et impression immédiate du contrat PDF officiel reprenant la charte graphique de Dar-Soins.

### 3.5 Catalogue Produits, Services & Gestion des Stocks
- **Gestion des Produits & Services** (`/gestionnaire/produits`, `/gestionnaire/produits/create`) :
  - Catalogue unifié : Actes de soins, forfaits de gardes, et consommables médicaux.
  - Suivi des prix d'achat, prix de vente client, rémunération soignant, gestion du stock d'alerte.
  - Générateur et impression de codes-barres (`/gestionnaire/produits/code-barres`).
- **Ajustements de Stock** (`/gestionnaire/ajustements`) : Enregistrement des surplus, pertes, avaries ou périmés avec mise à jour atomique du stock par entrepôt.
- **Transferts Inter-Entrepôts** (`/gestionnaire/transferts`) : Mouvement de matériel médical d'un entrepôt source vers un entrepôt cible.

### 3.6 Achats Fournisseurs, Ventes & Gestion des Retours
- **Achats Fournisseurs** (`/gestionnaire/achats`) : Enregistrement des bons de commande, suivi des réceptions et gestion des paiements.
- **Retours d'Achats** (`/gestionnaire/retours/achats`) : Déduction du stock d'entrepôt et émission du **Bon de Retour Officiel PDF** avec cachet de l'entreprise.
- **Ventes Directes & Retours de Ventes** (`/gestionnaire/retours/ventes`) : Enregistrement des retours clients et réintégration automatique des produits dans le stock.

### 3.7 Module Ressources Humaines (RH / HRM)
- **Fiches Employés** (`/gestionnaire/hrm/employes`) :
  - Liaison avec les comptes utilisateurs.
  - Distinction essentielle des infirmiers : **Rémunération par acte** (commission par soin réalisé) vs **Salarié mensuel fixe** (garde).
- **Pointage & Présences** (`/gestionnaire/hrm/presences`) : Enregistrement des heures d'arrivée, de départ, retards et absences.
- **Gestion des Congés** (`/gestionnaire/hrm/conges`) : Workflow complet de demande, validation, rejet et suivi des soldes de congés.
- **Fiches de Paie** (`/gestionnaire/hrm/paie`) : Calcul automatique du salaire net (Salaire de base + Commissions sur actes + Primes - Déductions) et suivi du statut de règlement.

### 3.8 Rapports Décisionnels, Analytics & Intelligence Artificielle
- **Rapports Financiers & Commerciaux** :
  - `RapportVentesPage.jsx` : Suivi du Chiffre d'Affaires, panier moyen, évolution des ventes.
  - `RapportAchatsPage.jsx` : Volume des dépenses, analyse par fournisseur.
  - `RapportStockPage.jsx` : Valeur totale du stock au prix d'achat et de vente, articles en alerte de réapprovisionnement.
  - `RapportCommissionsPage.jsx` : Calcul des commissions dues aux infirmiers par acte et par période.
- **Filtre par Date Universel (`ReportDateFilter.jsx`)** : Sélecteur de période dynamique (Aujourd'hui, 7 derniers jours, 30 derniers jours, Ce mois, Cette année, Période personnalisée).
- **Module IA & Analyses Prédictives (`AiReportsPage.jsx`)** : Synthèse automatique par Intelligence Artificielle mettant en évidence les tendances de rentabilité, les infirmiers les plus performants et les prévisions de stock.

### 3.9 Organisation, Calendrier Interactif & Gestion des Tâches
- **Calendrier Interactif (`CalendrierPage.jsx`)** : Vue planning complète regroupant les interventions programmées, les plannings de garde et les congés des soignants.
- **Gestion des Tâches (`TachesList.jsx`)** : Attribution de tâches administratives et médicales avec niveaux de priorité (Basse, Moyenne, Haute, Urgente) et dates d'échéance.
- **Profil Gestionnaire Interactif** : Consultation et mise à jour directe des coordonnées de l'administrateur.

### 3.10 Système de Notifications Temps Réel & Paramétrage
- **Notifications in-app** : Cloche interactive avec compteur en direct, toasts popups animés et marquage lu/non-lu.
- **Configuration des Canaux (`NotificationsSettings.jsx`)** : Paramétrage par événement (Nouvelle commande, Devis refusé, Intervention clôturée, etc.) sur les canaux Email, SMS et Application.
- **Paramètres Système (`ParametresSysteme.jsx`, `NumerotationSettings.jsx`)** : Configuration des mentions légales de l'entreprise (RC, ICE, IF, CNSS, TVA), préfixes de facturation et devises.

---

## 4. Optimisation Majeure de la Base de Données (62 → 55 Tables)

Une analyse approfondie du schéma relationnel PostgreSQL a permis d'éliminer **7 tables redondantes ou orphelines**, passant de **62 à 55 tables**, avec **0 perte de données et 0 impact fonctionnel** :

```
┌────────────────────────────────────────────────────────────────────────┐
│               ÉVOLUTION DU SCHÉMA POSTGRESQL (62 ➔ 55 TABLES)          │
├────────────────────────┬───────────────────┬───────────────────────────┤
│ Table Origine          │ Action            │ Justification Technique   │
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 1. signatures          │ 🗑️ Supprimée      │ Signature patient déjà    │
│                        │                   │ dans interventions (base64)│
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 2. gestionnaires       │ 🗑️ Supprimée      │ Rôles gérés à 100% via    │
│                        │                   │ Spatie (model_has_roles)  │
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 3. materiel_produit    │ 🗑️ Supprimée      │ Table pivot orpheline     │
│                        │                   │ (0 enregistrements)       │
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 4. unites_bases        │ 🔄 Fusionnée dans │ Table unifiée avec scope  │
│                        │    unites         │ type = 'unite_base'       │
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 5. intervention_refus  │ 🔄 Intégrée dans  │ Remplacée par colonne     │
│                        │    interventions  │ JSONB native PostgreSQL   │
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 6. materiels           │ 🔄 Absorbée dans  │ Catalogue unifié avec     │
│                        │    produits       │ type = 'consommable'      │
├────────────────────────┼───────────────────┼───────────────────────────┤
│ 7. localisations       │ 🔄 Intégrée dans  │ Coordonnées lat/lng avec  │
│                        │    interventions  │ accesseur rétro-compatible│
└────────────────────────┴───────────────────┴───────────────────────────┘
```

### 💡 Bénéfices de cette restructuration :
- **Requêtes SQL plus rapides** : Suppression des jointures `JOIN` superflues.
- **Création d'intervention atomique** : Réalisée en 1 seule requête au lieu de 2.
- **Rétro-compatibilité 100%** : Grâce à l'accesseur virtuel `$intervention->localisation`, aucun code React (Leaflet GPS, Dashboard) n'a été cassé.

---

## 5. Performances, Code-Splitting & Expérience Utilisateur (UI/UX)

- **Code-Splitting Global (`React.lazy` + `Suspense`)** :
  - Toutes les pages et modules ERP sont désormais chargés à la demande.
  - Réduction drastique du temps de chargement initial du bundle frontend.
- **Compression d'images côté client (`imageCompressor.js`)** :
  - Compression automatique des ordonnances, CIN et photos de diplômes avant téléversement.
- **Design System Harmonisé** :
  - Cartes d'intervention avec badges de statuts colorés et distinctifs.
  - Modales en `ReactPortal` avec scroll fluide et centrage parfait.
  - Typographie soignée et responsive sur tous les écrans (Desktop, Tablette, Mobile).

---

## 6. Journal Complet des Commits Git

| Hash Commit | Type | Description du Commit |
|:---|:---|:---|
| `c1f0577` | `refactor(db)` | Merge `materiels` into `produits` and `localisations` into `interventions` with virtual accessor |
| `b7325cf` | `refactor(db)` | Merge `unites_bases` into `unites` and `intervention_refus` into `interventions` JSONB column |
| `184b81f` | `refactor(db)` | Drop obsolete tables `signatures`, `gestionnaires` and `materiel_produit` cleanly |
| `604653d` | `fix(erp)` | Fix blank page in `DevisList` by correcting state variable and adding search & KPI stats cards |
| `eb74236` | `fix(pdf)` | Remove unsupported unicode symbols causing question marks in PDF rendering |
| `eb9715b` | `fix(facture)` | Display "Payé" dynamically in modalities de règlement when sale is paid |
| `31a552a` | `fix(pdf)` | Enlarge patient signature and company cachet for maximum visibility on invoices and quotes |
| `f8bcacf` | `fix(facture)` | Keep patient signature box on invoice while maintaining full A4 page layout and edge-to-edge footer |
| `e9e2610` | `fix(facture)` | Optimize invoice PDF with exact math, full A4 layout, and edge-to-edge footer bar |
| `df590b1` | `fix(devis)` | Fix green bottom bar to absolute bottom extremity of the page (`bottom: 0px`) |
| `990a5a2` | `fix(devis)` | Expand layout to fill full A4 page and remove unnecessary client signature box |
| `5eaf090` | `fix(devis)` | Restore full page A4 layout with balanced typography and signature block |
| `882a16a` | `fix(devis)` | Exact math calculations for quote/invoice PDFs, 10x speedup reducing render from 8-10s to ~1s |
| `b584df6` | `feat` | Module rapports et IA 100% fonctionnel avec données réelles et filtres dates, fix acceptation soignant |
| `2c543fc` | `feat` | Ajout module organisation, calendrier interactif, profil admin et optimisations interventions |
| `34793ea` | `feat(achats)` | Implémenter complètement le module Retour d'Achat avec gestion de stock et bon de retour PDF |
| `d6d533c` | `fix(contrats)`| Positionner le cachet de la société à l'intérieur de la rubrique Pour la Direction |
| `a98aac2` | `feat(contrats)`| Harmoniser le design PDF du contrat sur le style officiel avec logo et cachet entreprise |
| `108de15` | `fix(contrats)`| Corriger le chargement des listes de clients et infirmiers dans le formulaire de contrat |
| `3f1399e` | `feat(contrats)`| Intégrer les clauses juridiques et protocoles médicaux prêts à l'emploi par cas de garde |
| `ae696c4` | `feat(contrats)`| Implémenter le module complet contrats de garde médicale et restructurer les menus |
| `eec4d02` | `feat(hrm)` | Implémenter le module Ressources Humaines complet (employés, rémunération acte/salarié, paie, congés) |
| `361e969` | `feat(retours)`| Implémenter le module complet retour des ventes (liste, création, réintégration stock) |
| `dc89554` | `feat(stock)` | Implémenter le module de gestion de stock avec ajustements et transferts inter-entrepôts |
| `c979385` | `feat(notifs)` | Implémenter le système de notification in-app temps réel et configuration des canaux |

---

## 7. Bilan et Livrables

### 🌟 Points Forts du Projet :
1. **Couverture Métier Complète** : De la demande du patient sur mobile jusqu'au bilan comptable et à la paie des soignants dans l'ERP.
2. **Génération PDF Professionnelle** : Documents médicaux et commerciaux prêts pour l'impression haute fidélité (Devis, Factures, Contrats, Bons de retour).
3. **Architecture Épurée & Optimisée** : 55 tables relationnelles PostgreSQL normalisées, sans redondance, avec un code Laravel et React maintenable et documenté.
4. **Prêt pour Déploiement & Soutenance** : Projet testé de bout en bout avec build frontend validé et synchronisation continue sur GitHub.

---
*Document rédigé et validé pour le projet DAR-SOINS.*
