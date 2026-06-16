/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL du backend Spring (ex: http://localhost:8080). */
  readonly VITE_API_URL: string
  /** Cle localStorage qui stocke le JWT cote navigateur. */
  readonly VITE_TOKEN_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
