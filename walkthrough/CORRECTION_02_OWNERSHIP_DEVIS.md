# Correction #2 — Ownership `repondreDevisClient`

**Statut : ✅ Terminé**
**Tests : 13/13 ✅ (+2 nouveaux tests ownership)**

---

## Problème corrigé

`repondreDevisClient` n'avait aucune vérification d'appartenance.
N'importe quel client authentifié pouvait accepter ou refuser le devis d'une intervention
qui ne lui appartenait pas.

De plus, la route était déclarée dans le groupe `role:gestionnaire`, rendant la méthode
inaccessible aux clients et infirmiers qui en ont besoin.

---

## Fichiers modifiés

### `app/Http/Controllers/InterventionController.php`
- `repondreDevisClient()` : chargement de la relation `client` en plus de `devis`
- Vérification `$intervention->client->user_id !== Auth::id()` → 403 si non propriétaire

### `routes/api.php`
- `reponse-client` → déplacée du groupe `role:gestionnaire` vers le groupe `auth:sanctum` général
- `reponse-infirmier` → idem (un infirmier ne peut pas accéder aux routes gestionnaire)
- `arriver` → idem (check-in infirmier ne doit pas être derrière le middleware gestionnaire)

---

## Tests ajoutés — `tests/Feature/InterventionTest.php`

| Test | Résultat attendu |
|------|-----------------|
| `blocks a client from responding to another client devis` | 403 ✅ |
| `allows the owner client to respond to their devis` | 200 ✅ |

---

## Résultats complets

```
PASS  Tests\Unit\ExampleTest          ✓  1 test
PASS  Tests\Feature\AuthTest          ✓  3 tests
PASS  Tests\Feature\ExampleTest       ✓  1 test
PASS  Tests\Feature\InterventionTest  ✓  4 tests  ← +2 nouveaux
PASS  Tests\Feature\ProduitTest       ✓  4 tests

Tests: 13 passed (29 assertions) — Duration: 2.04s
```

## Mise à jour PLAN_CORRECTIONS.md

| # | Titre | Statut |
|---|-------|--------|
| 1 | Filtrage factures par utilisateur | ✅ |
| 2 | Ownership `repondreDevisClient` | ✅ |
| 6 | Unification système de rôles | ✅ |
