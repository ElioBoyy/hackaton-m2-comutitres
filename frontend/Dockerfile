# --- Build : install deps + build SSR (Vite / TanStack Start) ---
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# VITE_API_URL est inline au build par Vite : il DOIT etre fourni ici (build arg),
# pas au runtime. Passe par la CI depuis le secret VITE_API_URL.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# --- Runtime : sert le build SSR avec srvx (cf. script "start") ---
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY package.json ./
# Copie node_modules depuis le build stage — srvx y est inclus, pas besoin de réinstaller.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# srvx sert les fichiers statiques depuis public/ par defaut.
COPY --from=build /app/dist/client ./public

EXPOSE 3000
# srvx ecoute sur $PORT (defaut 3000). "npm start" -> npx srvx --prod ...
CMD ["npm", "start"]
