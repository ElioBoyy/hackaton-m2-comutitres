/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL du backend Spring (ex: http://localhost:8080). */
  readonly VITE_API_URL: string
  /** Cle localStorage qui stocke le JWT cote navigateur. */
  readonly VITE_TOKEN_KEY: string
  /** Numero du conseiller vocal Retell, affiche sur /contact (ex: +33 1 23 45 67 89). */
  readonly VITE_RETELL_PHONE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
