import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ApiError } from '~/lib/api'
import { login } from '~/lib/auth'
import { parseViolations } from '~/lib/validation'
import { LoginSchema } from '~/lib/schemas'
import { AuthLayout } from '~/components/AuthLayout'
import { Field } from '~/components/Field'
import { Button } from '~/components/Button'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

const FIELDS = ['email', 'password'] as const
type FieldKey = (typeof FIELDS)[number]

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<Record<FieldKey, string>>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function validateField(key: FieldKey, value: string): string | undefined {
    const result = LoginSchema.shape[key].safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  function update(key: FieldKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }))
    if (formError) setFormError(null)
  }

  function onBlur(key: FieldKey) {
    setFieldErrors((e) => ({ ...e, [key]: validateField(key, form[key]) }))
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    const result = LoginSchema.safeParse(form)
    if (!result.success) {
      const errs: Partial<Record<FieldKey, string>> = {}
      for (const issue of result.error.issues) {
        const k = issue.path[0] as FieldKey
        if (!errs[k]) errs[k] = issue.message
      }
      setFieldErrors(errs)
      return
    }

    setPending(true)
    try {
      await login(form.email.trim(), form.password)
      await navigate({ to: '/dashboard' })
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setFormError(m.auth_invalid_credentials())
        } else if (err.status === 400) {
          const body = err.body as { violations?: string[] } | undefined
          const { fields, unmatched } = parseViolations(body?.violations, FIELDS)
          setFieldErrors((prev) => ({ ...prev, ...fields }))
          if (!Object.keys(fields).length) {
            setFormError(unmatched.join(' • ') || m.auth_bad_request())
          }
        } else {
          setFormError(err.message)
        }
      } else {
        setFormError(m.auth_server_unreachable())
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title={m.login_title()}
      subtitle={m.login_subtitle()}
      footer={
        <span>
          {m.login_no_account_yet()}{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            {m.login_create_account_link()}
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label={m.register_fields_email()}
          type="email"
          autoComplete="email"
          placeholder={m.register_fields_email_placeholder()}
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          onBlur={() => onBlur('email')}
          error={fieldErrors.email}
        />
        <Field
          label={m.register_fields_password()}
          type="password"
          autoComplete="current-password"
          placeholder={m.register_fields_password_placeholder()}
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
          {pending ? m.login_signing_in() : m.auth_sign_in()}
        </Button>
      </form>
    </AuthLayout>
  )
}
