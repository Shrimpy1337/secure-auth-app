# 📖 Documentation de l'API

Base URL locale : `http://localhost:3000/api`

## Authentification

### `POST /auth/register`

Crée un nouveau compte utilisateur.

**Body**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponses**
| Code | Cas |
|---|---|
| 201 | Compte créé — retourne `{ id, email }` |
| 400 | Email invalide ou mot de passe < 10 caractères |
| 409 | Un compte existe déjà avec cet email |

---

### `POST /auth/login`

Authentifie un utilisateur et pose les cookies de session.

**Body**
```json
{
  "email": "user@example.com",
  "password": "motdepasse123"
}
```

**Réponses**
| Code | Cas |
|---|---|
| 200 | Connexion réussie — cookies `accessToken` et `refreshToken` posés (HttpOnly) |
| 400 | Email ou mot de passe manquant |
| 401 | Identifiants invalides |

---

### `POST /auth/refresh`

Renouvelle l'access token à partir du refresh token (cookie).

| Code | Cas |
|---|---|
| 200 | Nouveaux tokens émis (rotation) |
| 401 | Refresh token absent, expiré ou invalide |

---

### `POST /auth/logout`

Révoque la session courante et efface les cookies.

| Code | Cas |
|---|---|
| 200 | Déconnexion effectuée |

---

### `GET /auth/me`

Route protégée, exemple d'utilisation du middleware `requireAuth`.

**Headers requis** : cookie `accessToken` valide

| Code | Cas |
|---|---|
| 200 | Retourne `{ userId }` |
| 401 | Non authentifié ou token invalide/expiré |

---

## Health check

### `GET /health`

Vérifie que le serveur répond.

| Code | Cas |
|---|---|
| 200 | `{ "status": "ok" }` |
