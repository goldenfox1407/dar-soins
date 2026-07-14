# Correction #11 — Tests unitaires `ServiceTarification`

## Problème

Aucun test sur le cœur financier de l'application.

## Fichier créé

`backend/tests/Unit/ServiceTarificationTest.php` — 7 tests :

| Test | Scénario |
|------|----------|
| prix soin sans remise | 100 × 1.20 = 120 TTC |
| remise percent | (100 - 10%) × 1.20 = 108 TTC |
| remise fixe | (100 - 20) × 1.20 = 96 TTC |
| frais déplacement | (100 + 4×2.5) × 1.20 = 132 TTC |
| tarif_km_manuel | (100 + 2×5) × 1.20 = 132 TTC |
| garde_malade | 100×3h × 1.20 = 360 TTC |
| Config absente | `ModelNotFoundException` levée |

## Fix annexe

`tests/Pest.php` — `uses(...)->in('Feature', 'Unit')` pour bootstrapper Laravel dans les tests Unit.

## Résultat

- 21/21 tests verts ✅ (7 nouveaux Unit + 14 Feature existants)
