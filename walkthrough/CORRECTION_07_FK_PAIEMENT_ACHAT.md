# Correction #7 — Clé étrangère réelle paiement/achat

**Statut : ✅ Terminé**
**Tests : 14/14 ✅**

---

## Problème corrigé

La relation entre un paiement et son achat était gérée par un pattern `LIKE` sur `reference` :

```php
// AVANT — fragile, non indexé, impossible à contraindre
TransactionFinanciere::where('reference', 'LIKE', 'PAY_ACHAT_' . $achat->id . '%')
```

Problèmes :
- Aucune contrainte d'intégrité en base — un paiement pouvait exister sans achat valide
- `LIKE` non indexé — scan complet de la table à chaque appel
- Pattern de string fragile — un changement de format casse tout silencieusement
- Impossible de faire un `JOIN` ou une relation Eloquent propre

---

## Fichiers modifiés

### `database/migrations/2026_07_13_174352_add_achat_id_to_transactions_financieres.php` (nouveau)
- Colonne `achat_id` nullable après `compte_id`
- Foreign key `constrained('achats')->nullOnDelete()` — si l'achat est supprimé, `achat_id` passe à null (pas de cascade destructive)

### `app/Models/TransactionFinanciere.php`
- `achat_id` ajouté dans `$fillable`
- Relation `belongsTo(Achat::class)` ajoutée

### `app/Models/Achat.php`
- Relation `paiements()` → `hasMany(TransactionFinanciere::class)` ajoutée

### `app/Http/Controllers/AchatController.php`

**`getPaiements()`** — avant/après :
```php
// AVANT
TransactionFinanciere::where('reference', 'LIKE', 'PAY_ACHAT_' . $achat->id . '%')

// APRÈS
$achat->paiements()->orderBy('created_at', 'desc')->get()
```

**`storePaiement()`** — avant/après :
```php
// AVANT
TransactionFinanciere::create([...]) + LIKE pour recalculer le total

// APRÈS
$achat->paiements()->create(['achat_id' => $achat->id, ...])
$achat->paiements()->sum('montant')  // requête indexée sur FK
```

---

## Migration appliquée

```
2026_07_13_174352_add_achat_id_to_transactions_financieres ... DONE (75ms)
```

---

## Résultats des tests

```
PASS  Tests\Unit\ExampleTest          ✓  1 test
PASS  Tests\Feature\AuthTest          ✓  3 tests
PASS  Tests\Feature\ExampleTest       ✓  1 test
PASS  Tests\Feature\InterventionTest  ✓  5 tests
PASS  Tests\Feature\ProduitTest       ✓  4 tests

Tests: 14 passed (31 assertions) — Duration: 2.07s
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
| 7 | Clé étrangère paiement/achat | ✅ |
