# jegeremacartenavigo — Hackaton M2 (Comutitres)

> Application web de gestion des abonnements Navigo : souscription en ligne, dépôt de pièces justificatives, suivi de dossier, SAV, conseiller IA (RAG). Backend Spring Boot + Frontend TanStack Start, déployable en une commande.

**Dépôt** : <https://github.com/ElioBoyy/hackaton-m2-comutitres>
**Démo en ligne** : front <https://jgmcn.mathistassart.fr> · API <https://api-jgmcn.mathistassart.fr>

---

## 🚀 TL;DR — Lancer le projet en local

```sh
git clone https://github.com/ElioBoyy/hackaton-m2-comutitres.git
cd hackaton-m2-comutitres

# 1) Variables d'environnement
cp backend/.env.example backend/.env       # → renseigner VOYAGE_API_KEY + MISTRAL_API_KEY (pour le chat IA)
cp frontend/.env.example frontend/.env     # défauts OK pour du local

# 2) Backend (terminal 1) — démarre Postgres + MinIO en Docker automatiquement
cd backend
export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home   # macOS Homebrew si nécessaire
./mvnw -DskipTests install                                                    # 1ʳᵉ fois uniquement
./mvnw -pl bootstrap spring-boot:run -Dspring-boot.run.profiles=seed          # API + données de démo

# 3) Frontend (terminal 2)
cd ../frontend
npm install
npm run dev
```

Ensuite, ouvrir :
- 🌐 **Frontend** : <http://localhost:3000>
- 📚 **Swagger** : <http://localhost:8080/swagger-ui.html>
- ❤️ **Health** : <http://localhost:8080/actuator/health>
- 🗂️ **MinIO Console** : <http://localhost:9001> (login `jgmcn` / `jgmcnjgmcn`)

Se connecter avec un compte de [démonstration](#-comptes-de-démonstration) — par exemple `lea.martin@example.com` / `client-demo`.

---

## 📋 Pré-requis

| Outil | Version minimale | Testé avec |
|---|---|---|
| **Docker Desktop** | récent | 4.x |
| **Java JDK** | ≥ 17 | **JDK 25 / 26** |
| **Node.js** | ≥ 22.12 | **24.16** |
| **npm** | livré avec Node | |

> Tout le reste (Maven, Postgres, MinIO) est géré : `./mvnw` pour Maven, Docker Compose lancé automatiquement par Spring Boot pour Postgres + MinIO.

> 💡 **macOS** : si `java` n'est pas dans le `PATH`, le wrapper `./mvnw` a besoin de `JAVA_HOME` :
> ```sh
> export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
> ```

---

## ⚙️ Variables d'environnement

### `backend/.env` (depuis `backend/.env.example`)

| Variable | Requise ? | Description |
|---|---|---|
| `VOYAGE_API_KEY` | ✅ pour le chat IA | Embeddings Voyage AI (RAG) — <https://www.voyageai.com> |
| `MISTRAL_API_KEY` | ✅ pour le chat IA | LLM Mistral — <https://console.mistral.ai> |
| `INFOBIP_API_KEY` + `INFOBIP_BASE_URL` | optionnel | 2FA SMS. Sans, le code OTP n'est pas envoyé. |
| `INFOBIP_2FA_APPLICATION_ID` / `MESSAGE_ID` | optionnel | Laisser vide au 1er lancement, recopier depuis les logs ensuite. |
| `RESEND_API_KEY` | optionnel | Emails (notifications de statut). Sans, no-op silencieux. |
| `RESEND_FROM_EMAIL` | optionnel | Défaut `noreply@comutitres.fr` (domaine custom à vérifier dans Resend). En dev : `onboarding@resend.dev`. |

### `frontend/.env` (depuis `frontend/.env.example`)

| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Base URL du backend (inlinée au build par Vite). |
| `VITE_TOKEN_KEY` | `jgmcn.access_token` | Clé `localStorage` où est stocké le JWT. |
| `VITE_RETELL_PHONE` | (vide) | Numéro du conseiller vocal Retell, affiché sur `/contact`. |

---

## 👥 Comptes de démonstration

Lancer le backend avec le profil **`seed`** (`-Dspring-boot.run.profiles=seed`) pour les insérer. Le seeder est **idempotent** : aucun risque à relancer.

### 🧑‍💼 Agents (backoffice) — `/backoffice/login`

| Email | Mot de passe | Rôle |
|---|---|---|
| `claire.dupont@idfm.fr` | `AG-1001-demo` | Gestionnaire (lecture + maj dossiers) |
| `marc.lefevre@idfm.fr` | `AG-1002-demo` | Administrateur (toutes permissions) |

### 👤 Clients — `/login`

| Email | Mot de passe | Profil | Particularité |
|---|---|---|---|
| `lea.martin@example.com` | `client-demo` | Étudiante (Paris) | 4 dossiers (BROUILLON, EN_VERIFICATION, INCOMPLET, ACTIF) + pièces + notifications |
| `karim.haddad@example.com` | `client-demo` | Parent (Boulogne) | rattaché à Noah |
| `noah.haddad@example.com` | `client-demo` | Enfant (lié à Karim) | démo de relation parent/tuteur |
| `jacques.bernard@example.com` | `client-demo` | Retraité (Ivry) | 3 dossiers (EN_ATTENTE_PAIEMENT, VALIDE, ACTIF) |
| `sophie.nguyen@example.com` | `client-demo` | Apprentie (Montreuil) | 3 dossiers (REJETE, RESILIE, EXPIRE) |

### 🌱 Données seedées en plus des comptes

- **8 départements** Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)
- **9 situations** (étudiant, apprenti, secondaire, demandeur d'emploi, RSA/ASS, 65+, RQTH, salarié, famille nombreuse)
- **14 types d'abonnement** (Navigo Annuel, Mois, Semaine, Découverte, Liberté+, Senior, Améthyste, Imagine R, Scolaire, Étudiant, Apprenti, Solidarité 75/50 %, Gratuité, Transport solidaire)
- **9 statuts dossier** + **11 types de pièces justificatives** + mapping pièces requises par abonnement
- **10 dossiers de démo** dans tous les états, **8 pièces justificatives** (validées/rejetées/en attente), **4 notifications**

> 📄 Code du seeder : [`DataSeeder.java`](backend/bootstrap/src/main/java/fr/jegeremacartenavigo/bootstrap/seed/DataSeeder.java)

---

## 🏗️ Stack technique

| Couche | Stack |
|---|---|
| **Backend** | Spring Boot 4.1 · Java 25 · PostgreSQL 17 + pgvector · MinIO · JWT · Flyway · Clean Architecture + CQRS |
| **Frontend** | TanStack Start (SSR) · React 19 · Vite 8 · TypeScript 6 · Tailwind 4 · Zod · Redux Toolkit · Paraglide i18n (5 langues) · Leaflet |
| **IA** | Voyage AI (embeddings) + Mistral (LLM) pour le chat RAG |
| **Notifications** | Infobip (2FA SMS) · Resend (emails) |
| **DevOps** | Docker Compose · GitHub Actions → GHCR · Coolify + Traefik (prod) |

> 📬 **Tester l'API** : collection Postman dans [`backend/postman/jegeremacartenavigo.postman_collection.json`](backend/postman/jegeremacartenavigo.postman_collection.json) (variables `baseUrl` + `accessToken` rempli automatiquement par `/auth/login`). Swagger UI : <http://localhost:8080/swagger-ui.html>.

---

## 🔌 Ports utilisés

| Service | Port hôte → conteneur | Notes |
|---|---|---|
| Backend (Spring) | `8080` | |
| Frontend (Vite) | `3000` | Exposé sur `0.0.0.0` → accessible depuis un téléphone du LAN |
| PostgreSQL | `5434 → 5432` | Décalé (5432/5433 souvent pris). Pour repasser à 5432, éditer `compose.yaml` **et** `application.yml`. |
| MinIO S3 | `9000` | API S3 |
| MinIO console | `9001` | UI web — login `jgmcn` / `jgmcnjgmcn` |

---

## 🚢 Déploiement (production)

Déploiement par **Coolify** (orchestration Docker Compose + reverse proxy Traefik HTTPS) via [`deploy/compose.prod.yaml`](deploy/compose.prod.yaml).

- **CI/CD** : 2 workflows GitHub Actions ([`backend.yml`](.github/workflows/backend.yml), [`frontend.yml`](.github/workflows/frontend.yml)) — tests + build d'image + push GHCR sur `main`. Déploiement SSH **en sommeil** tant que la repo-variable `DEPLOY_ENABLED != 'true'`.
- **Variables Coolify** : à renseigner dans l'UI à partir de [`deploy/.env.prod.example`](deploy/.env.prod.example) (Postgres, MinIO, JWT secret, clés API IA / SMS / email, `FRONTEND_ORIGIN` pour le CORS).
- **Images** : publiées sur GHCR (`ghcr.io/elioboyy/hackaton-backend`, `…/hackaton-frontend`), tag écrasé par la CI à chaque déploiement.

---

## 📁 Arborescence du repo

```
hackaton-m2-comutitres/
├── backend/                      # API Spring Boot (4 modules)
│   ├── domain/                   # entités, VO, règles métier (Java pur)
│   ├── application/              # use cases, CQRS, pipeline middleware
│   ├── infrastructure/           # adapters web + JPA + MinIO + IA + OTP + email
│   ├── bootstrap/                # main, config, DataSeeder, application.yml, corpus RAG
│   ├── compose.yaml              # postgres + minio (dev local)
│   ├── compose.full.yaml         # postgres + minio + backend (tout en conteneurs)
│   ├── Dockerfile
│   └── postman/                  # collection Postman
├── frontend/                     # TanStack Start (SSR React)
│   ├── src/
│   │   ├── routes/               # routing fichier
│   │   ├── components/           # UI réutilisables (+ backoffice/, ui/, illustrations/)
│   │   ├── lib/                  # api.ts, auth.ts, dossier.ts, sav.ts, schemas.ts (Zod)
│   │   ├── domain/, store/, styles/
│   │   └── paraglide/            # i18n généré (ne pas éditer)
│   ├── messages/                 # traductions fr/en/pt/es/zh
│   ├── Dockerfile
│   └── vite.config.ts
├── deploy/
│   ├── compose.prod.yaml         # Coolify (Traefik front)
│   └── .env.prod.example
└── .github/workflows/            # CI backend + frontend
```

---

## 🧯 Troubleshooting

| Problème | Solution |
|---|---|
| `./mvnw` ne trouve pas Java | Exporter `JAVA_HOME` (cf. pré-requis). |
| Port 5432 / 5433 / 5434 déjà pris | Adapter `compose.yaml` **et** `application.yml` (datasource URL). |
| Erreur 401 sur Swagger | Récupérer un token via `/auth/login`, cliquer **Authorize**. |
| Chat IA ne répond pas | Vérifier `VOYAGE_API_KEY` et `MISTRAL_API_KEY` dans `backend/.env`. |
| SMS / emails non envoyés | Variables `INFOBIP_*` / `RESEND_API_KEY` optionnelles : sans, no-op (warn loggé, jamais bloquant). |
| `application failed to start: minio:9000 connection refused` | `docker compose -f backend/compose.yaml up -d` puis relancer le backend. |

---

## 👥 Contributeurs

Projet réalisé dans le cadre du **Hackaton M2** (équipe Comutitres) par :

- **André Domingues Ramos** — [@ADG08](https://github.com/ADG08)
- **Elise Garrouty** — [@Loeryx](https://github.com/Loeryx)
- **Mathis Sportiello** — [@ElioBoyy](https://github.com/ElioBoyy)
- **Mathis Tassart** — [@FaziGIT](https://github.com/FaziGIT)
- **Tessa Germain** — [@TessaGermain](https://github.com/TessaGermain)
