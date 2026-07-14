# Correction #4 — Suppression du fallback hardcodé `5.0 km`

**Statut : ✅ Terminé**
**Tests : 14/14 ✅ (+1 nouveau test 422)**

---

## Problème corrigé

`cloturerIntervention` calculait la facture sur une distance arbitraire de **5 km**
si `distance_manuelle` était null — erreur de facturation silencieuse, sans aucune alerte.

```php
// AVANT — dangereux
$distance = $intervention->distance_manuelle ?? 5.0; // Fallback
```

---

## Fichiers modifiés

### `app/Http/Controllers/InterventionController.php`

**Import ajouté :**
```php
use App\Services\ServiceGeolocalisation;
```

**Logique de résolution de distance (même priorité que `genererDevis`) :**

```
1. distance_manuelle définie → utiliser cette valeur
2. infirmier a des coordonnées GPS + localisation disponible → calculer via Haversine
3. Aucune donnée → 422 avec message explicite
```

**Réponse 422 :**
```json
{
  "message": "Distance non disponible. Veuillez saisir la distance manuellement avant de clôturer."
}
```

---

## Tests mis à jour — `tests/Feature/InterventionTest.php`

| Test | Changement |
|------|-----------|
| `allows infirmier to cloturer intervention` | Ajout de `distance_manuelle: 3.5` sur l'intervention factory |
| `returns 422 when cloturer has no distance available` | **Nouveau** — vérifie le 422 quand ni distance_manuelle ni GPS |

---

## Résultats des tests

```
PASS  Tests\Unit\ExampleTest          ✓  1 test
PASS  Tests\Feature\AuthTest          ✓  3 tests
PASS  Tests\Feature\ExampleTest       ✓  1 test
PASS  Tests\Feature\InterventionTest  ✓  5 tests  ← +1 nouveau
PASS  Tests\Feature\ProduitTest       ✓  4 tests

Tests: 14 passed (31 assertions) — Duration: 2.06s
```

## Mise à jour PLAN_CORRECTIONS.md

| # | Titre | Statut |
|---|-------|--------|
| 1 | Filtrage factures par utilisateur | ✅ |
| 2 | Ownership `repondreDevisClient` | ✅ |
| 3 | Transactions DB `commanderSoin` / `cloturer` | ✅ |
| 4 | Suppression fallback 5 km | ✅ |
| 6 | Unification système de rôles | ✅ |
