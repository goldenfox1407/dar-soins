# Corrections #8 & #9 — URL API via `.env` + Intercepteur Axios 401/403

## #8 — URL API configurable

**Problème :** `baseURL: 'http://127.0.0.1:8000/api'` hardcodé dans `api.js`.

**Fichiers modifiés :**
- `frontend/src/services/api.js` — `baseURL: import.meta.env.VITE_API_URL`
- `frontend/.env` — `VITE_API_URL=http://127.0.0.1:8000/api`
- `frontend/.env.example` — `VITE_API_URL=https://api.darsoins.ma`

## #9 — Intercepteur réponse Axios

**Problème :** Token expiré → requêtes silencieusement échouées, aucun redirect.

**Fichiers modifiés :**
- `frontend/src/services/api.js` — `api.interceptors.response.use()`
  - `401` → clear sessionStorage + redirect `/login`
  - `403` → redirect `/${user.role}` ou `/`

## Résultat

- 21/21 tests verts ✅
