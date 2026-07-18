# 🏗️ Architecture

Ce document explique les choix de conception du projet, au-delà du simple fonctionnement.

## Pattern MVC

Le projet suit une architecture MVC adaptée à une API REST (pas de vue HTML, mais la même logique de séparation) :

```
Requête HTTP
    │
    ▼
routes/          → définit les endpoints, aucune logique métier
    │
    ▼
middlewares/      → vérifications transverses (auth, rate limiting)
    │
    ▼
controllers/      → logique métier (validation, orchestration)
    │
    ▼
models/           → accès aux données (schéma Mongoose)
```

**Pourquoi cette séparation ?**
Chaque couche a une seule responsabilité, ce qui rend le code plus facile à tester isolément et à faire évoluer sans effets de bord. Par exemple, changer de base de données (MongoDB → PostgreSQL) n'impacterait que la couche `models/`, pas les routes ni les contrôleurs.

## Séparation app / serveur

`src/app.js` construit uniquement l'application Express (middlewares, routes), sans se connecter à la base de données ni démarrer le serveur. `server.js`, à la racine, gère le cycle de vie (connexion DB puis démarrage).

**Pourquoi ?** Ça permet de tester l'application (`tests/`) sans avoir besoin d'une vraie base de données ni d'un port réseau ouvert — les tests importent directement `src/app.js` avec Supertest, qui simule les requêtes HTTP en mémoire.

## Gestion des erreurs

Un middleware d'erreur centralisé (fin de `src/app.js`) intercepte toutes les exceptions non gérées, évitant qu'une stack trace ne fuite au client. Chaque contrôleur utilise des blocs `try/catch` explicites pour retourner des codes HTTP appropriés (400, 401, 409, 500).

## Sécurité par construction

La sécurité n'est pas ajoutée après coup mais fait partie de l'architecture :
- Validation systématique des entrées avant tout traitement (`validator.js`)
- Messages d'erreur volontairement génériques sur les routes d'authentification (pas d'énumération de comptes)
- Aucune donnée sensible (mot de passe, refresh token) stockée en clair

## Tests

Les tests (Jest + Supertest) valident le comportement de l'API au niveau HTTP plutôt que d'implémenter des détails internes — ce qui permet de refactorer le code interne sans casser les tests, tant que le contrat de l'API (routes, codes de statut, format de réponse) reste stable.
