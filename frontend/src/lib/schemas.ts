// Les messages custom sont des cles Paraglide (register_validation_*) traduites
// dans le composant. Les contraintes built-in (email, min, max) sont localisees
// par Zod via z.config(locale) dans lib/i18n.ts.
import { z } from 'zod'

export const MIN_AGE = 13
export const MAX_AGE = 120

function ageFromIso(iso: string): number {
  const birth = new Date(iso)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return age
}

const BirthDateSchema = z
  .string()
  .min(1, { error: 'register_validation_birth_date_required' })
  .refine((v) => !Number.isNaN(new Date(v).getTime()), {
    error: 'register_validation_birth_date_invalid',
  })
  .refine((v) => new Date(v) < new Date(), {
    error: 'register_validation_birth_date_past',
  })
  .refine((v) => ageFromIso(v) >= MIN_AGE, {
    error: 'register_validation_age_too_young',
  })
  .refine((v) => ageFromIso(v) <= MAX_AGE, {
    error: 'register_validation_age_too_old',
  })

export const StepIdentitySchema = z.object({
  prenom: z.string().trim().min(1, { error: 'register_validation_first_name_required' }),
  nom: z.string().trim().min(1, { error: 'register_validation_last_name_required' }),
  dateNaissance: BirthDateSchema,
})

export const StepAccessSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(100),
})

// Pas de min(8) sur le mot de passe : un compte ancien peut avoir <8 chars.
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export const AddressSchema = z.object({
  numeroEtVoie: z.string().min(1, { error: 'register_validation_address_required' }),
  codePostal: z.string().regex(/^\d{5}$/),
  ville: z.string().min(1),
  departementCode: z.string().min(2).max(3),
  departementLibelle: z.string().min(1),
})

export const RegisterSchema = z.object({
  ...StepIdentitySchema.shape,
  ...StepAccessSchema.shape,
  ...AddressSchema.shape,
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export function birthDateBounds(): { min: string; max: string } {
  const today = new Date()
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const min = new Date(today)
  min.setFullYear(today.getFullYear() - MAX_AGE)
  const max = new Date(today)
  max.setFullYear(today.getFullYear() - MIN_AGE)
  return { min: iso(min), max: iso(max) }
}

export function computeAge(isoDate: string): number | null {
  if (!isoDate) return null
  const age = ageFromIso(isoDate)
  return Number.isFinite(age) && age >= 0 ? age : null
}

export const InfosTiersSchema = z.object({
  prenom: z.string().trim().min(1, { error: 'wizard_validation_required' }),
  nom: z.string().trim().min(1, { error: 'wizard_validation_required' }),
})

export const CarteBancaireSchema = z.object({
  nom: z.string().trim().min(1, { error: 'wizard_validation_required' }),
  numero: z
    .string()
    .regex(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/, { error: 'wizard_validation_card_number' }),
  expiration: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, { error: 'wizard_validation_expiry' }),
  cvc: z.string().regex(/^\d{3,4}$/, { error: 'wizard_validation_cvc' }),
})

export const MandatSepaSchema = z.object({
  nom: z.string().trim().min(1, { error: 'wizard_validation_required' }),
  iban: z
    .string()
    .toUpperCase()
    .regex(/^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/, { error: 'wizard_validation_iban' }),
  bic: z
    .string()
    .toUpperCase()
    .regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, { error: 'wizard_validation_bic' }),
})

export type InfosTiersInput = z.infer<typeof InfosTiersSchema>
export type CarteBancaireInput = z.infer<typeof CarteBancaireSchema>
export type MandatSepaInput = z.infer<typeof MandatSepaSchema>
