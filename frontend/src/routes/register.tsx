import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ApiError } from '~/lib/api'
import { register } from '~/lib/auth'
import {
  computeAge,
  parseViolations,
  validateEmail,
  validatePassword,
  validatePastDate,
  validateRequired,
} from '~/lib/validation'
import { AuthLayout } from '~/components/AuthLayout'
import { Field } from '~/components/Field'
import { Button } from '~/components/Button'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

const FIELDS = ['email', 'password', 'nom', 'prenom', 'dateNaissance'] as const
type FieldKey = (typeof FIELDS)[number]

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Record<FieldKey, string>>({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
  })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function validateField(key: FieldKey, value: string): string | undefined {
    switch (key) {
      case 'email':
        return validateEmail(value)
      case 'password':
        return validatePassword(value)
      case 'nom':
        return validateRequired(value, 'Le nom')
      case 'prenom':
        return validateRequired(value, 'Le prenom')
      case 'dateNaissance':
        return validatePastDate(value)
    }
  }

  function update(key: FieldKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key]) {
      setFieldErrors((e) => ({ ...e, [key]: undefined }))
    }
    if (formError) setFormError(null)
  }

  function onBlur(key: FieldKey) {
    setFieldErrors((e) => ({ ...e, [key]: validateField(key, form[key]) }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const errors: Partial<Record<FieldKey, string>> = {}
    for (const k of FIELDS) {
      const err = validateField(k, form[k])
      if (err) errors[k] = err
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setPending(true)
    try {
      await register({ ...form, email: form.email.trim() })
      await navigate({ to: '/me' })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setFieldErrors((prev) => ({
            ...prev,
            email: 'Un compte existe deja avec cet email.',
          }))
        } else if (err.status === 400) {
          const body = err.body as { violations?: string[] } | undefined
          const { fields, unmatched } = parseViolations(body?.violations, FIELDS)
          setFieldErrors((prev) => ({ ...prev, ...fields }))
          if (!Object.keys(fields).length) {
            setFormError(unmatched.join(' • ') || 'Requete invalide.')
          }
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError('Impossible de joindre le serveur. Reessayez.')
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title="Creer mon compte"
      subtitle="Quelques infos pour personnaliser vos recommandations."
      footer={
        <span>
          Vous avez deja un compte ?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Se connecter
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Prenom"
            type="text"
            autoComplete="given-name"
            required
            value={form.prenom}
            onChange={(e) => update('prenom', e.target.value)}
            onBlur={() => onBlur('prenom')}
            error={fieldErrors.prenom}
          />
          <Field
            label="Nom"
            type="text"
            autoComplete="family-name"
            required
            value={form.nom}
            onChange={(e) => update('nom', e.target.value)}
            onBlur={() => onBlur('nom')}
            error={fieldErrors.nom}
          />
        </div>
        <Field
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => onBlur('email')}
          error={fieldErrors.email}
        />
        <Field
          label="Mot de passe"
          hint="8 caracteres minimum."
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          onBlur={() => onBlur('password')}
          error={fieldErrors.password}
        />
        {(() => {
          const age = computeAge(form.dateNaissance)
          return (
            <Field
              id="field-date-de-naissance"
              label={
                age != null
                  ? `Date de naissance (${age} an${age > 1 ? 's' : ''})`
                  : 'Date de naissance'
              }
              type="date"
              autoComplete="bday"
              required
              value={form.dateNaissance}
              onChange={(e) => update('dateNaissance', e.target.value)}
              onBlur={() => onBlur('dateNaissance')}
              error={fieldErrors.dateNaissance}
            />
          )
        })()}
        {formError && (
          <div
            role="alert"
            className="rounded-xl bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        )}
        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? 'Creation...' : 'Creer mon compte'}
        </Button>
      </form>
    </AuthLayout>
  )
}
