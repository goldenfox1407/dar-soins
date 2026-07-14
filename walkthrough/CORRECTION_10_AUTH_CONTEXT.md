# Correction #10 — React Context Auth centralisé

## Problème

`user` et `token` lus directement depuis `sessionStorage` dans chaque composant — duplication, pas de source de vérité unique.

## Fichiers modifiés

- `frontend/src/context/AuthContext.jsx` *(nouveau)* — `AuthProvider` avec `user`, `token`, `login()`, `logout()`
- `frontend/src/main.jsx` — wrapping `<App>` dans `<AuthProvider>`
- `frontend/src/components/ProtectedRoute.jsx` — consomme `useAuth()` au lieu de `sessionStorage`
- `frontend/src/pages/Login.jsx` — appelle `login(user, token)` du contexte

## Résultat

- 21/21 tests verts ✅
- Zéro duplication de logique auth dans les pages
