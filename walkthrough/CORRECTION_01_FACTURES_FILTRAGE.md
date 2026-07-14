# Correction #1 — Filtrage des factures par utilisateur

**Statut : ✅ Terminé**
**Fichier modifié :** `backend/app/Http/Controllers/FactureController.php`

---

## Problème corrigé

`index()` retournait 100% des factures à n'importe quel utilisateur authentifié.
`genererPdf()` ne vérifiait pas que la facture appartenait à l'utilisateur demandeur.

---

## Ce qui a été fait

### `index()`
- `client` → filtre par `intervention.client_id = $user->client->id`
- `infirmier` → filtre par `intervention.infirmier_id = $user->infirmier->id`
- `gestionnaire` → aucun filtre, accès total

### `genererPdf($id)`
- `client` → vérifie que `intervention.client.user_id === Auth::id()` → 403 sinon
- `infirmier` → vérifie que `intervention.infirmier_id === $user->infirmier->id` → 403 sinon
- `gestionnaire` → accès total

---

## Résultats des tests

```
PASS  Tests\Unit\ExampleTest          ✓
PASS  Tests\Feature\AuthTest          ✓ (3 tests)
PASS  Tests\Feature\ExampleTest       ✓
PASS  Tests\Feature\InterventionTest  ✓ (2 tests)
FAIL  Tests\Feature\ProduitTest       ⨯ (3 tests) — PRÉEXISTANT, non lié à cette correction
```

Les 3 échecs `ProduitTest` sont préexistants : le middleware `role:gestionnaire` (Spatie)
bloque car les tests ne font pas `assignRole()`. Sera résolu par la correction **#6**.

---

## Aucune régression introduite ✅
