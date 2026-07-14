# Correction #3 — Transactions DB `commanderSoin` / `cloturerIntervention`

**Statut : ✅ Terminé**
**Tests : 13/13 ✅**

---

## Problème corrigé

### `commanderSoin`
Créait une `Localisation` puis une `Intervention` sans transaction.
Si la création de l'`Intervention` échouait (contrainte DB, timeout, etc.),
la `Localisation` restait orpheline en base — donnée inutilisable et non nettoyable.

### `cloturerIntervention`
Créait séquentiellement `ConstanteMedicale` + `Consommation(s)` + `Facture` sans transaction.
Un échec à mi-chemin laissait l'intervention dans un état incohérent :
constantes enregistrées mais pas la facture, ou consommables partiellement créés.

---

## Fichiers modifiés

### `app/Http/Controllers/InterventionController.php`

**Import ajouté :**
```php
use Illuminate\Support\Facades\DB;
```

**`commanderSoin`** — enveloppé dans `DB::transaction()` :
- `Localisation::create()` et `Intervention::create()` sont atomiques
- Si l'un échoue → rollback automatique, rien n'est persisté

**`cloturerIntervention`** — enveloppé dans `DB::transaction()` :
- `ConstanteMedicale::create()`, `fill()`, `Consommation::create()` (boucle), `save()` et `calculerFacture()` sont atomiques
- Refactoring bonus : les 4 `if ($request->has(...))` remplacés par un seul `fill(array_filter([...]))` — plus concis, même comportement
- En cas d'exception → rollback complet, l'intervention reste dans son état précédent

---

## Comportement en cas d'erreur

| Avant | Après |
|-------|-------|
| Localisation orpheline si Intervention échoue | Rollback total — rien en base |
| Constantes créées sans facture si erreur tardive | Rollback total — état cohérent garanti |
| Consommations partielles possibles | Rollback total — tout ou rien |

---

## Note
Le fallback `5.0 km` dans `cloturerIntervention` est conservé temporairement —
il sera supprimé à l'étape **#4**.

---

## Résultats des tests

```
PASS  Tests\Unit\ExampleTest          ✓  1 test
PASS  Tests\Feature\AuthTest          ✓  3 tests
PASS  Tests\Feature\ExampleTest       ✓  1 test
PASS  Tests\Feature\InterventionTest  ✓  4 tests
PASS  Tests\Feature\ProduitTest       ✓  4 tests

Tests: 13 passed (29 assertions) — Duration: 2.01s
```

## Mise à jour PLAN_CORRECTIONS.md

| # | Titre | Statut |
|---|-------|--------|
| 1 | Filtrage factures par utilisateur | ✅ |
| 2 | Ownership `repondreDevisClient` | ✅ |
| 3 | Transactions DB `commanderSoin` / `cloturer` | ✅ |
| 6 | Unification système de rôles | ✅ |
