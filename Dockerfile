# Étape 1 : Construction (Build)
FROM node:22-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json ./

# Installation des dépendances complètes pour le build
RUN npm install

# Copie des fichiers sources
COPY . .

# Construction du front-end et du serveur compilé
RUN npm run build

# Étape 2 : Image de production légère
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copie des fichiers de dépendances pour installer uniquement la production
COPY package.json ./
RUN npm install --omit=dev

# Copie des artefacts compilés depuis l'étape de build
COPY --from=builder /app/dist ./dist

# Port d'écoute du serveur
EXPOSE 3000

# Démarrage du serveur Node.js en production
CMD ["npm", "start"]
