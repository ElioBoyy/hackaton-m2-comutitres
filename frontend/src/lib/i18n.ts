import { z } from 'zod'
import * as zodLocales from 'zod/locales'
import { getLocale } from '~/paraglide/runtime'

// Aligne les messages d'erreur Zod built-in (email, min, max) sur la locale UI.
// Fallback EN pour les locales sans equivalent Zod (zh -> zhCN).
const ZOD_LOCALES: Record<string, () => Parameters<typeof z.config>[0]> = {
  fr: zodLocales.fr,
  en: zodLocales.en,
  pt: zodLocales.pt,
  es: zodLocales.es,
  zh: zodLocales.zhCN,
}

const locale = getLocale()
z.config((ZOD_LOCALES[locale] ?? zodLocales.en)())
