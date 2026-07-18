# 🔐 Secure Auth App — Application web avec authentification sécurisée

![CI/CD](https://github.com/Shrimpy1337/secure-auth-app/actions/workflows/ci-cd.yml/badge.svg)

Application web développée pour concevoir **et** exploiter volontairement ses propres vulnérabilités, afin de valider concrètement les correctifs de sécurité mis en place — plutôt que de les appliquer en théorie.

## 🎯 Contexte

Ce projet a été réalisé dans le cadre de ma formation d'ingénieur en cybersécurité à l'ISEP. L'objectif : construire un système d'authentification complet, puis me mettre à la place d'un attaquant pour tenter de le compromettre, avant de corriger chaque faille identifiée. Le projet inclut également un pipeline CI/CD complet (tests automatisés + build + publication d'image Docker).

## ⚙️ Fonctionnalités

- Inscription et connexion utilisateur
- Gestion de sessions via **JWT** (access token + refresh token)
- Hachage et salage des mots de passe (**bcrypt**)
- Cookies sécurisés (**HttpOnly**, **SameSite**)
- Protections contre les vulnérabilités **OWASP Top 10** (voir ci-dessous)

## 🛡️ Vulnérabilités testées et corrigées

| Vulnérabilité | Test effectué | Correctif appliqué |
|---|---|---|
| XSS (Cross-Site Scripting) | Injection de scripts dans les champs de saisie | Sanitization des entrées utilisateur côté serveur |
| CSRF (Cross-Site Request Forgery) | Simulation de requêtes forgées depuis un domaine externe | Cookies `SameSite`, vérification d'origine |
| Vol de session | Interception de tokens en clair | Cookies `HttpOnly`, rotation des refresh tokens |
| Mots de passe en clair | Analyse de la base de données | Hachage + salage avec `bcrypt` |
| Injection SQL | Tentatives d'injection sur les formulaires | Requêtes préparées / paramétrées |

## 🧱 Stack technique

- **Backend** : Node.js / Express
- **Base de données** : MongoDB (Mongoose)
- **Authentification** : JWT (jsonwebtoken), bcrypt
- **Déploiement** : Docker (multi-stage), Docker Compose
- **CI/CD** : GitHub Actions (tests automatisés, build et publication d'image sur GitHub Container Registry)
- **Tests** : Jest, Supertest

## 🚀 Lancer le projet en local

```bash
# Cloner le repo
git clone https://github.com/Shrimpy1337/secure-auth-app.git
cd secure-auth-app

# Lancer avec Docker Compose
docker compose up --build
```

L'application est accessible sur `http://localhost:3000`.

## ✅ Tests et CI/CD

```bash
npm install
npm test
```

Un pipeline GitHub Actions exécute automatiquement les tests et publie une image Docker sur GitHub Container Registry à chaque push sur `main`.

## 📂 Structure du projet

```
secure-auth-app/
├── .github/workflows/
│   └── ci-cd.yml
├── src/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── models/
│   └── app.js
├── tests/
│   └── health.test.js
├── server.js
├── docker-compose.yml
├── Dockerfile
└── README.md
```
## 📚 Documentation complémentaire

- [Choix d'architecture](./ARCHITECTURE.md)
- [Documentation de l'API](./docs/API.md)

## 📈 Pistes d'amélioration

- Ajout d'une authentification à deux facteurs (2FA)
- Tests de pénétration automatisés (OWASP ZAP)
- Rate limiting sur les endpoints d'authentification

## 👤 Auteur

**Yegor Tsyro** — Étudiant ingénieur en cybersécurité, ISEP Paris
[yegor.tsyro@eleve.isep.fr](mailto:yegor.tsyro@eleve.isep.fr)
