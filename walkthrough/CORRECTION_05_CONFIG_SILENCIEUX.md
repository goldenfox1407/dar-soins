# Correction #5 — `Config::create` silencieux dans `ServiceTarification`

**Statut : ✅ Terminé**
**Tests : 14/14 ✅**

---

## Problème corrigé

```php
// AVANT — dangereux
$config = Config::first() ?? Config::create(['tkmf_sm' => 2.5, 'tva' => 20]);
```

Si la table `configs` était vide en production (migration oubliée, seeder non lancé,
suppression accidentelle), le service créait silencieusement une config avec des valeurs
par défaut hardcodées. Les calculs de tarification tournaient sur des données fantômes
sans aucune alerte — bug financier invisible.

---

## Fichiers modifiés

### `app/Services/ServiceTarification.php`
```php
// APRÈS — sûr
$config = Config::firstOrFail();
```
Si la config est absente → `ModelNotFoundException` levée → Laravel retourne
automatiquement un **404** avec log d'erreur — le problème est immédiatement visible.

### `database/seeders/ConfigSeeder.php` (nouveau)
Seeder dédié et idempotent via `firstOrCreate` :
```php
Config::firstOrCreate([], ['tkmf_sm' => 2.5, 'tva' => 20]);
```
- Peut être relancé sans créer de doublon
- Garantit la présence de la config après chaque `php artisan migrate --seed`

### `database/seeders/DatabaseSeeder.php`
- Suppression du `Config::create()` direct (non idempotent, plantait au 2e seed)
- Remplacement par `$this->call([ConfigSeeder::class, ...])` en tête de liste
- Import `use App\Models\Config` supprimé (plus nécessaire)

### `tests/Feature/InterventionTest.php`
- Test `cloturer` : ajout de `Config::firstOrCreate([], [...])` en début de test
  pour que `firstOrFail()` trouve la config dans l'environnement de test isolé

---

## Comportement en cas d'absence de config

| Avant | Après |
|-------|-------|
| Config créée silencieusement avec valeurs hardcodées | `ModelNotFoundException` → 404 + log |
| Calculs financiers sur données fantômes | Erreur visible immédiatement |
| Aucune alerte | Stack trace dans les logs |

---

## Résultats des tests

```
PASS  Tests\Unit\ExampleTest          ✓  1 test
PASS  Tests\Feature\AuthTest          ✓  3 tests
PASS  Tests\Feature\ExampleTest       ✓  1 test
PASS  Tests\Feature\InterventionTest  ✓  5 tests
PASS  Tests\Feature\ProduitTest       ✓  4 tests

Tests: 14 passed (31 assertions) — Duration: 2.10s
```

## Mise à jour PLAN_CORRECTIONS.md

| # | Titre | Statut |
|---|-------|--------|
| 1 | Filtrage factures par utilisateur | ✅ |
| 2 | Ownership `repondreDevisClient` | ✅ |
| 3 | Transactions DB `commanderSoin` / `cloturer` | ✅ |
| 4 | Suppression fallback 5 km | ✅ |
| 5 | `Config::create` silencieux | ✅ |
| 6 | Unification système de rôles | ✅ |
