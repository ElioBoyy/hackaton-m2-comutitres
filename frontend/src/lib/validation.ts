/**
 * Validateurs cote front, alignes avec les contraintes Bean Validation du
 * backend (RegisterCommand / LoginCommand). Retournent un message d'erreur en
 * cas d'echec ou undefined si OK. Permettent un feedback immediat sans appel
 * reseau.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return "L'email est requis."
  if (!EMAIL_RE.test(trimmed)) return "Format d'email invalide (ex: nom@domaine.fr)."
  return undefined
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Le mot de passe est requis.'
  if (value.length < 8) return '8 caracteres minimum.'
  if (value.length > 100) return '100 caracteres maximum.'
  return undefined
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} est requis.`
  return undefined
}

export function validatePastDate(value: string): string | undefined {
  if (!value) return 'La date de naissance est requise.'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date invalide.'
  if (date >= new Date()) return 'La date doit etre dans le passe.'
  return undefined
}

/**
 * Age (annees revolues) a partir d'une date ISO `YYYY-MM-DD`. Renvoie null si
 * la valeur est vide, invalide ou future.
 */
export function computeAge(isoDate: string): number | null {
  if (!isoDate) return null
  const birth = new Date(isoDate)
  if (Number.isNaN(birth.getTime())) return null
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age >= 0 ? age : null
}

/**
 * Parse les violations renvoyees par le backend (RFC 7807 ProblemDetail).
 * Chaque entree est de la forme `"field : message"`. Le `field` peut etre
 * suffixe (ex: `registerCommand.email`) - on ne garde que le dernier segment.
 */
export function parseViolations<K extends string>(
  violations: string[] | undefined,
  knownFields: readonly K[],
): { fields: Partial<Record<K, string>>; unmatched: string[] } {
  const fields: Partial<Record<K, string>> = {}
  const unmatched: string[] = []
  for (const raw of violations ?? []) {
    const sep = raw.indexOf(' : ')
    if (sep === -1) {
      unmatched.push(raw)
      continue
    }
    const path = raw.slice(0, sep).trim()
    const message = raw.slice(sep + 3).trim()
    const key = path.split('.').pop() as K
    if (knownFields.includes(key)) {
      fields[key] = message
    } else {
      unmatched.push(raw)
    }
  }
  return { fields, unmatched }
}
