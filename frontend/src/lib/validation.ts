// Validateurs string-level conservés pour les écrans qui ne sont pas passés
// sous Zod (ex: backoffice/login). Le register/login utilisateur utilise les
// schémas Zod dans lib/schemas.
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

// Format backend (RFC 7807) : "field : message", field eventuellement suffixe
// (ex: "registerCommand.email") - on garde uniquement le dernier segment.
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
