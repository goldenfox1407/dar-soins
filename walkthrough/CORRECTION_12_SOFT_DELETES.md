# Correction #12 — Soft Deletes sur les modèles critiques

## Problème

Suppressions définitives sur `Intervention`, `Facture`, `Devis`, `Produit` — irréversibles.

## Fichiers modifiés

- `backend/database/migrations/2026_07_13_175737_add_soft_deletes_to_core_tables.php` *(nouveau)* — `softDeletes()` sur les 4 tables
- `backend/app/Models/Intervention.php` — `use SoftDeletes`
- `backend/app/Models/Facture.php` — `use SoftDeletes`
- `backend/app/Models/Devis.php` — `use SoftDeletes`
- `backend/app/Models/Produit.php` — `use SoftDeletes`

## Migration appliquée

```
2026_07_13_175737_add_soft_deletes_to_core_tables  25.84ms  DONE
```

## Résultat

- 21/21 tests verts ✅
- Les suppressions écrivent `deleted_at` — données récupérables
