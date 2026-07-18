# --- Étape 1 : installation des dépendances ---
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# --- Étape 2 : image finale, plus légère ---
FROM node:20-alpine
WORKDIR /app

# Utilisateur non-root : limite l'impact en cas de compromission du conteneur
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps /app/node_modules ./node_modules
COPY . .

USER appuser

EXPOSE 3000
CMD ["node", "server.js"]
