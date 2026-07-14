# Corrections #1 & #6 — Filtrage Factures + Unification Rôles

**Statut : ✅ Terminé**
**Tests : 11/11 ✅**

---

## Correction #6 — Unification système de rôles

### Problème corrigé
Double système de rôles incohérent :
- Champ `role` sur `User` utilisé dans les contrôleurs (`$user->role === 'xxx'`)
- Spatie Permissions utilisé dans les middlewares (`role:gestionnaire`)
- Les deux non synchronisés → bugs garantis à l'évolution

### Fichiers modifiés

#### `database/factories/UserFactory.php`
- Ajout méthode privée `ensureRole()` : crée le rôle Spatie si absent + `assignRole()`
- Chaque state (`client`, `infirmier`, `gestionnaire`) appelle `ensureRole()` dans `afterCreating`

#### `app/Http/Controllers/AuthController.php`
- `register()` : après création du User, `assignRole($user->role)` via Spatie
- `user()` : `$user->role ===` → `$user->hasRole()`

#### `app/Http/Controllers/InterventionController.php`
- `index()` : `$user->role ===` → `$user->hasRole()`
- `cloturerIntervention()` : vérification ownership via `hasRole('infirmier')`
- `arriverSurSite()` : `$user->role !== 'infirmier'` → `!$user->hasRole('infirmier')`
- `repondreInfirmier()` : `$user->role !== 'infirmier'` → `!$user->hasRole('infirmier')`

#### `app/Models/Gestionnaire.php`
- Ajout du trait `HasFactory` (manquant — bloquait `Gestionnaire::factory()`)

#### `tests/Feature/ProduitTest.php`
- `User::factory()->create(['role' => 'gestionnaire'])` → `User::factory()->gestionnaire()->create()`
- Garantit que `assignRole()` est appelé dans les tests

---

## Correction #1 — Filtrage factures (retesté et confirmé)

### `app/Http/Controllers/FactureController.php`
- `index()` : filtre par rôle (client → ses factures, infirmier → les siennes, gestionnaire → tout)
- `genererPdf()` : vérification ownership → 403 si accès cross-user

---

## Résultats des tests

```
PASS  Tests\Unit\ExampleTest          ✓  1 test
PASS  Tests\Feature\AuthTest          ✓  3 tests
PASS  Tests\Feature\ExampleTest       ✓  1 test
PASS  Tests\Feature\InterventionTest  ✓  2 tests
PASS  Tests\Feature\ProduitTest       ✓  4 tests  ← était en échec, maintenant vert

Tests: 11 passed (26 assertions) — Duration: 1.81s
```

## Mise à jour PLAN_CORRECTIONS.md

| # | Titre | Statut |
|---|-------|--------|
| 1 | Filtrage factures par utilisateur | ✅ |
| 6 | Unification système de rôles | ✅ |
