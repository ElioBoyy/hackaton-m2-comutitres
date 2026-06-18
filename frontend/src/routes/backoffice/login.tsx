import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { ApiError } from '~/lib/api'
import { login } from '~/lib/auth'
import { parseViolations, validateEmail, validatePassword } from '~/lib/validation'
import { AuthLayout } from '~/components/AuthLayout'
import { Field } from '~/components/Field'
import { Button } from '~/components/Button'

export const Route = createFileRoute('/backoffice/login')({
  component: BackofficeLoginPage,
})

const FIELDS = ['email', 'password'] as const
type FieldKey = (typeof FIELDS)[number]

function BackofficeLoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Record<FieldKey, string>>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function validateField(key: FieldKey, value: string): string | undefined {
    if (key === 'email') return validateEmail(value)
    if (key === 'password') return validatePassword(value)
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
      await login(form.email.trim(), form.password)
      await navigate({ to: '/backoffice/dashboard' })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError('Email ou mot de passe invalide.')
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
    <AuthLayout title="Connexion agent">
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
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
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
          onBlur={() => onBlur('password')}
          error={fieldErrors.password}
        />
        {formError && (
          <div
            role="alert"
            className="rounded-xl bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        )}
        <Button type="submit" disabled={pending} className="mt-2">
          {pending ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
  )
}
