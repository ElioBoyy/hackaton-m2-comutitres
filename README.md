# Hackaton — monorepo

Deux applications, mises en place et câblées (setup initial, sans features) :

| Dossier | Quoi | Stack |
|---|---|---|
| [`jegeremacartenavigo/backend`](jegeremacartenavigo/backend) | API | Spring Boot 4.1 — Clean Architecture multi-module + CQRS |
| [`jegeremacartenavigo/frontend`](jegeremacartenavigo/frontend) | App web | TanStack Start (Vite 8, React 19) — câblé au backend |
| [`comutitres.fr`](comutitres.fr) | Site vitrine statique | Astro 6 (sortie statique) |

## Versions (vérifiées le 2026-06-15)

Spring Boot **4.1.0** · Java **25** (LTS, compilé via le JDK 26 installé) · Maven **3.9.16**
· TanStack Start `@tanstack/react-start` **1.168** · TanStack Router **1.170** · Vite **8.0.16** · React **19.2** · TypeScript **6.0**
· Astro **6.4.7** · Node **24.16**

> Sources : `start.spring.io/metadata/client` (défaut Spring Boot + cibles Java) et le registre npm. Le setup TanStack Start reprend l'exemple officiel `start-bare` du dépôt TanStack (version-matched).

## Pré-requis

- **Docker** (pour PostgreSQL du backend).
- **Node ≥ 22.12** (24 installé).
- Un **JDK ≥ 17** (JDK 26 installé via Homebrew). `java` n'est pas dans le `PATH` de ce poste : le wrapper `./mvnw` a besoin de `JAVA_HOME` :
  ```sh
  export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
  ```
  (Le `mvn` Homebrew, lui, trouve le JDK seul.)

---

## 1) Backend — `jegeremacartenavigo/backend`

### Architecture (multi-module par couches, règle de dépendance imposée par le build)

```
bootstrap  ──▶ infrastructure ──▶ application ──▶ domain
(main, CORS,    (adapters web +    (use cases,     (entités, VO,
 middleware web) persistance JPA,   CQRS, pipeline   règles métier ;
                 bus CQRS Spring)   middleware)      Java pur, 0 framework)
```

- **CQRS — pattern Request/Response** : `Command<R>` / `Query<R>` (toutes deux des `Request<R>`) → `CommandBus.send()` / `QueryBus.ask()` → `CommandHandler` / `QueryHandler` → `Response`. Résolution des handlers + cache dans `infrastructure/cqrs`.
- **Middleware applicatif** (pipeline autour de chaque requête CQRS) : `PipelineBehavior` ordonné — `LoggingBehavior` (order 0), `ValidationBehavior` (order 100, Bean Validation). On en ajoute en exposant un bean `PipelineBehavior`.
- **Middleware web** : `CorrelationIdFilter` (servlet, en-tête `X-Correlation-Id` + MDC) et `RequestLoggingInterceptor` (Spring MVC).
- **CORS** : global `/**`, piloté par `app.cors.*` dans `application.yml` (autorise `http://localhost:3000`).
- **Persistance** : Spring Data JPA + PostgreSQL via `compose.yaml`. Aucune entité pour l'instant.

### Lancer

```sh
cd jegeremacartenavigo/backend
export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home

# 1re fois : installer les modules internes dans le repo local
./mvnw -DskipTests install

# Lancer l'API (démarre aussi le conteneur PostgreSQL via docker-compose)
./mvnw -pl bootstrap spring-boot:run
```

- API sur **http://localhost:8080**, santé : **http://localhost:8080/actuator/health**.
- Au démarrage, Spring lance le conteneur `postgres:17` défini dans `compose.yaml` et câble la datasource. À l'arrêt, il l'arrête.

> **Port PostgreSQL = 5434 (côté hôte)** : `5432` et `5433` sont déjà occupés sur ce poste par d'autres projets (`scruti-*`). Pour revenir au standard `5432`, éditez `compose.yaml` (`"5432:5432"`) **et** `spring.datasource.url` dans `application.yml`.
>
> Pour gérer Postgres à la main plutôt qu'automatiquement : `docker compose up -d` puis lancer avec `-Dspring-boot.run.arguments=--spring.docker.compose.enabled=false`.

### Build / jar

```sh
./mvnw -DskipTests package        # jar exécutable : bootstrap/target/jegeremacartenavigo-backend.jar
```

> Vérifié : build sans warning, et démarrage end-to-end (Postgres + JPA + Tomcat + CORS + middleware) confirmé.

---

## 2) Frontend — `jegeremacartenavigo/frontend`

```sh
cd jegeremacartenavigo/frontend
npm install
npm run dev        # http://localhost:3000
```

- **Câblage backend** : client HTTP dans [`src/lib/api.ts`](jegeremacartenavigo/frontend/src/lib/api.ts), base URL via `VITE_API_URL` (`.env`, défaut `http://localhost:8080`). `credentials: 'include'` (le CORS backend autorise les credentials). Aucune route ne consomme l'API pour l'instant — c'est le point de départ à utiliser.
- Routage fichier (`src/routes/`), `routeTree.gen.ts` généré par le plugin TanStack Start.
- `npm run build` (build SSR + `tsc --noEmit`), `npm run start` (sert le build de prod).

---

## 3) comutitres.fr — `comutitres.fr`

```sh
cd comutitres.fr
npm install
npm run dev        # http://localhost:4321 (dev)
npm run build      # génère dist/ (HTML statique, déployable partout)
```

> `npm install` signale 3 vulnérabilités « high » : ce sont des avis **esbuild** tirés transitivement par le Vite épinglé d'Astro (lecture de fichier via dev-server Windows ; RCE en contexte Deno). Failles **dev-only**, absentes du build statique. Ne pas faire `npm audit fix --force` (rétrograderait Astro en v2). Se résorbera quand Astro montera son Vite.
