/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL du backend Spring (ex: http://localhost:8080). */
  readonly VITE_API_URL: string
  /** Cle localStorage qui stocke le JWT cote navigateur. */
  readonly VITE_TOKEN_KEY: string
  /** Numero du conseiller vocal Retell, affiche dans le bandeau contact (/aide, /sav). */
  readonly VITE_RETELL_PHONE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
