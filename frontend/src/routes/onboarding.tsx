import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ApiError } from '~/lib/api'
import {
  isAuthenticated,
  logout,
  envoyerCodeTelephone,
  verifierCodeTelephone,
} from '~/lib/auth'
import { OtpSchema } from '~/lib/schemas'
import { AuthLayout } from '~/components/AuthLayout'
import { Field } from '~/components/Field'
import { Button } from '~/components/Button'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()
  const [envoye, setEnvoye] = useState(false)
  const [telephoneMasque, setTelephoneMasque] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isAuthenticated()) navigate({ to: '/login' })
  }, [navigate])

  function handleApiError(err: unknown) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
      logout()
      navigate({ to: '/login' })
      return
    }
    setFormError(
      err instanceof ApiError ? m.onboarding_error() : m.auth_server_unreachable(),
    )
  }

  async function envoyer() {
    setFormError(null)
    setCodeError(null)
    setBusy(true)
    try {
      const res = await envoyerCodeTelephone()
      if (res.dejaVerifie) {
        await navigate({ to: '/dashboard' })
        return
      }
      setTelephoneMasque(res.telephoneMasque)
      setEnvoye(true)
    } catch (err) {
      handleApiError(err)
    } finally {
      setBusy(false)
    }
  }

  async function verifier() {
    setFormError(null)
    const parsed = OtpSchema.safeParse({ code })
    if (!parsed.success) {
      setCodeError(m.onboarding_validation_code_invalid())
      return
    }
    setCodeError(null)
    setBusy(true)
    try {
      const res = await verifierCodeTelephone(code)
      if (res.verifie) {
        await navigate({ to: '/dashboard' })
        return
      }
      setCodeError(
        res.tentativesRestantes != null
          ? m.onboarding_code_wrong_attempts({ n: res.tentativesRestantes })
          : m.onboarding_code_wrong(),
      )
    } catch (err) {
      handleApiError(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={m.onboarding_title()}
      subtitle={envoye ? m.onboarding_sent({ phone: telephoneMasque }) : m.onboarding_subtitle()}
      footer={
        <Link to="/dashboard" className="text-gray-700 hover:underline">
          {m.onboarding_skip()}
        </Link>
      }
    >
      <div className="flex flex-col gap-4">
        {!envoye ? (
          <Button type="button" onClick={envoyer} disabled={busy}>
            {busy ? m.common_loading() : m.onboarding_send_code()}
          </Button>
        ) : (
          <>
            <Field
              label={m.onboarding_code_label()}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="••••••"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ''))
                if (codeError) setCodeError(null)
              }}
              error={codeError ?? undefined}
            />
            <Button type="button" onClick={verifier} disabled={busy}>
              {busy ? m.common_loading() : m.onboarding_verify()}
            </Button>
            <button
              type="button"
              onClick={envoyer}
              disabled={busy}
              className="text-sm font-medium text-primary hover:underline disabled:opacity-50"
            >
              {m.onboarding_resend()}
            </button>
          </>
        )}

        {formError && (
          <div
            role="alert"
            className="rounded-xl bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        )}
      </div>
    </AuthLayout>
  )
}
