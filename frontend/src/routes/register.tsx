import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { ApiError } from '~/lib/api'
import { register } from '~/lib/auth'
import { parseViolations } from '~/lib/validation'
import {
  AddressSchema,
  MAX_AGE,
  MIN_AGE,
  RegisterSchema,
  StepAccessSchema,
  StepIdentitySchema,
  birthDateBounds,
  computeAge,
} from '~/lib/schemas'
import type { BanAddress } from '~/lib/ban'
import { AuthLayout } from '~/components/AuthLayout'
import { Field } from '~/components/Field'
import { Button } from '~/components/Button'
import { Stepper } from '~/components/Stepper'
import { AddressAutocomplete } from '~/components/AddressAutocomplete'
import * as m from '~/paraglide/messages'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

const FIELDS = [
  'email',
  'password',
  'telephone',
  'nom',
  'prenom',
  'dateNaissance',
  'numeroEtVoie',
  'codePostal',
  'ville',
  'departementCode',
  'departementLibelle',
] as const
type FieldKey = (typeof FIELDS)[number]

const STEP_SCHEMAS = [StepIdentitySchema, StepAccessSchema, AddressSchema] as const

const ADDRESS_KEYS = [
  'numeroEtVoie',
  'codePostal',
  'ville',
  'departementCode',
  'departementLibelle',
] as const

const STEP_OF_FIELD: Partial<Record<FieldKey, number>> = {
  prenom: 0,
  nom: 0,
  dateNaissance: 0,
  email: 1,
  password: 1,
  telephone: 1,
  numeroEtVoie: 2,
  codePostal: 2,
  ville: 2,
  departementCode: 2,
  departementLibelle: 2,
}

// Si `message` est une cle Paraglide on la traduit ; sinon (deja localise
// par la locale Zod) on renvoie tel quel.
function translateMessage(message: string): string {
  const messages = m as unknown as Record<string, (p?: Record<string, unknown>) => string>
  if (typeof messages[message] !== 'function') return message
  if (message === 'register_validation_age_too_young') return messages[message]({ min: MIN_AGE })
  if (message === 'register_validation_age_too_old') return messages[message]({ max: MAX_AGE })
  return messages[message]()
}

function fieldError(errors: ReadonlyArray<unknown>): string | undefined {
  if (errors.length === 0) return undefined
  const first = errors[0]
  const msg =
    typeof first === 'string'
      ? first
      : (first as { message?: string } | null)?.message
  return msg ? translateMessage(msg) : undefined
}

function extractErrorMsg(err: unknown): string | undefined {
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err) {
    const v = (err as { message?: unknown }).message
    return typeof v === 'string' ? v : undefined
  }
  return undefined
}

function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [addressLabel, setAddressLabel] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [backendAddressError, setBackendAddressError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  function apiErrorToFormErrors(err: unknown): {
    form?: string
    fields?: Partial<Record<FieldKey, string>>
  } | null {
    if (!(err instanceof ApiError)) return { form: m.auth_server_unreachable() }
    if (err.status === 409) return { fields: { email: m.auth_email_already_used() } }
    if (err.status === 400) {
      const body = err.body as { violations?: string[] } | undefined
      const { fields, unmatched } = parseViolations(body?.violations, FIELDS)
      if (Object.keys(fields).length) return { fields }
      return { form: unmatched.join(' • ') || m.auth_bad_request() }
    }
    return { form: err.message }
  }

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      telephone: '',
      nom: '',
      prenom: '',
      dateNaissance: '',
      numeroEtVoie: '',
      codePostal: '',
      ville: '',
      departementCode: '',
      departementLibelle: '',
    } as Record<FieldKey, string>,
    validators: {
      onSubmit: RegisterSchema,
      onSubmitAsync: async ({ value }) => {
        try {
          await register({
            email: value.email.trim(),
            password: value.password,
            telephone: value.telephone.trim(),
            nom: value.nom,
            prenom: value.prenom,
            dateNaissance: value.dateNaissance,
            numeroEtVoie: value.numeroEtVoie,
            codePostal: value.codePostal,
            ville: value.ville,
            departementCode: value.departementCode,
            departementLibelle: value.departementLibelle,
          })
          return null
        } catch (err) {
          return apiErrorToFormErrors(err)
        }
      },
    },
    onSubmit: async () => {
      setFormError(null)
      await navigate({ to: '/onboarding' })
    },
  })

  const addressPicked = Boolean(form.state.values.numeroEtVoie)
  const addressError: string | null =
    backendAddressError ??
    (submitAttempted && !addressPicked ? m.register_validation_address_required() : null)

  const [prevStep, setPrevStep] = useState(step)
  if (step !== prevStep) {
    setPrevStep(step)
    if (step === 2) {
      setSubmitAttempted(false)
      setBackendAddressError(null)
    }
  }

  function clearFieldServerError(key: FieldKey) {
    form.setFieldMeta(key, (prev) =>
      prev.errorMap.onSubmit === undefined
        ? prev
        : { ...prev, errorMap: { ...prev.errorMap, onSubmit: undefined } },
    )
  }

  function pickAddress(addr: BanAddress) {
    form.setFieldValue('numeroEtVoie', addr.numeroEtVoie)
    form.setFieldValue('codePostal', addr.codePostal)
    form.setFieldValue('ville', addr.ville)
    form.setFieldValue('departementCode', addr.departementCode)
    form.setFieldValue('departementLibelle', addr.departementLibelle)
    setAddressLabel(addr.label)
    setBackendAddressError(null)
  }

  function resetAddress() {
    for (const k of ADDRESS_KEYS) form.setFieldValue(k, '')
    setAddressLabel('')
    setSubmitAttempted(false)
    setBackendAddressError(null)
  }

  function validateStep(s: number): boolean {
    if (s === 2) {
      if (!addressPicked) {
        setSubmitAttempted(true)
        return false
      }
      return true
    }
    const schema = STEP_SCHEMAS[s]
    const result = schema.safeParse(form.state.values)
    if (result.success) return true
    for (const issue of result.error.issues) {
      const key = issue.path[0] as FieldKey
      form.setFieldMeta(key, (prev) => ({
        ...prev,
        errorMap: { ...prev.errorMap, onBlur: translateMessage(issue.message) },
      }))
    }
    return false
  }

  async function handleAction() {
    if (step !== STEP_SCHEMAS.length - 1) {
      if (validateStep(step)) {
        setStep((s) => Math.min(STEP_SCHEMAS.length - 1, s + 1))
      }
      return
    }
    if (!validateStep(step)) return

    setFormError(null)
    setBackendAddressError(null)
    await form.handleSubmit()

    const addressKey = ADDRESS_KEYS.find(
      (k) => (form.getFieldMeta(k)?.errors.length ?? 0) > 0,
    )
    if (addressKey) {
      const msg = extractErrorMsg(form.getFieldMeta(addressKey)?.errors[0])
      if (msg) setBackendAddressError(msg)
      if (step !== 2) setStep(2)
      return
    }
    const badKey = FIELDS.find(
      (k) => (form.getFieldMeta(k)?.errors.length ?? 0) > 0,
    )
    if (badKey) {
      const target = STEP_OF_FIELD[badKey] ?? step
      if (target !== step) setStep(target)
      return
    }
    const formLvl = form.state.errorMap.onSubmit
    const formMsg = extractErrorMsg(formLvl)
    if (formMsg) setFormError(formMsg)
  }

  function goPrev() {
    setFormError(null)
    setStep((s) => Math.max(0, s - 1))
  }

  const steps = [
    m.register_steps_identity(),
    m.register_steps_access(),
    m.register_steps_address(),
  ] as const

  return (
    <AuthLayout
      title={m.auth_create_account()}
      subtitle={m.auth_subtitle()}
      footer={
        <span>
          {m.auth_already_have_account()}{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            {m.auth_sign_in()}
          </Link>
        </span>
      }
    >
      <Stepper steps={steps} current={step} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleAction()
        }}
        noValidate
        className="flex flex-col gap-4"
      >
        <div
          style={{ display: step === 0 ? 'flex' : 'none' }}
          className="flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <form.Field
              name="prenom"
              validators={{ onBlur: StepIdentitySchema.shape.prenom }}
            >
              {(field) => (
                <Field
                  label={m.register_fields_first_name()}
                  type="text"
                  autoComplete="given-name"
                  placeholder={m.register_fields_first_name_placeholder()}
                  required
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    clearFieldServerError('prenom')
                  }}
                  onBlur={field.handleBlur}
                  error={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
            <form.Field
              name="nom"
              validators={{ onBlur: StepIdentitySchema.shape.nom }}
            >
              {(field) => (
                <Field
                  label={m.register_fields_last_name()}
                  type="text"
                  autoComplete="family-name"
                  placeholder={m.register_fields_last_name_placeholder()}
                  required
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    clearFieldServerError('nom')
                  }}
                  onBlur={field.handleBlur}
                  error={fieldError(field.state.meta.errors)}
                />
              )}
            </form.Field>
          </div>
          <form.Field
            name="dateNaissance"
            validators={{ onBlur: StepIdentitySchema.shape.dateNaissance }}
          >
            {(field) => {
              const age = computeAge(field.state.value)
              const showAge = age != null && age >= MIN_AGE && age <= MAX_AGE
              const { min, max } = birthDateBounds()
              return (
                <Field
                  id="field-date-de-naissance"
                  label={
                    showAge
                      ? m.register_fields_birth_date_with_age({
                          age: age!,
                          unit:
                            age! > 1
                              ? m.register_year_plural()
                              : m.register_year_singular(),
                        })
                      : m.register_fields_birth_date()
                  }
                  type="date"
                  autoComplete="bday"
                  placeholder={m.register_fields_birth_date_placeholder()}
                  required
                  min={min}
                  max={max}
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    clearFieldServerError('dateNaissance')
                  }}
                  onBlur={field.handleBlur}
                  error={fieldError(field.state.meta.errors)}
                />
              )
            }}
          </form.Field>
        </div>

        <div
          style={{ display: step === 1 ? 'flex' : 'none' }}
          className="flex-col gap-4"
        >
          <form.Field
            name="email"
            validators={{ onBlur: StepAccessSchema.shape.email }}
          >
            {(field) => (
              <Field
                label={m.register_fields_email()}
                type="email"
                autoComplete="email"
                placeholder={m.register_fields_email_placeholder()}
                required
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  clearFieldServerError('email')
                }}
                onBlur={field.handleBlur}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="password"
            validators={{ onBlur: StepAccessSchema.shape.password }}
          >
            {(field) => (
              <Field
                label={m.register_fields_password()}
                hint={m.register_fields_password_hint()}
                type="password"
                autoComplete="new-password"
                placeholder={m.register_fields_password_placeholder()}
                required
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  clearFieldServerError('password')
                }}
                onBlur={field.handleBlur}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
          <form.Field
            name="telephone"
            validators={{ onBlur: StepAccessSchema.shape.telephone }}
          >
            {(field) => (
              <Field
                label={m.register_fields_phone()}
                hint={m.register_fields_phone_hint()}
                type="tel"
                autoComplete="tel"
                placeholder={m.register_fields_phone_placeholder()}
                required
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(e.target.value)
                  clearFieldServerError('telephone')
                }}
                onBlur={field.handleBlur}
                error={fieldError(field.state.meta.errors)}
              />
            )}
          </form.Field>
        </div>

        <div
          style={{ display: step === 2 ? 'flex' : 'none' }}
          className="flex-col gap-4"
        >
          {addressPicked ? (
            <div className="rounded-xl border border-gray-300 bg-white px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-dark">
                    {form.state.values.numeroEtVoie}
                  </p>
                  <p className="text-sm text-gray-700">
                    {form.state.values.codePostal} {form.state.values.ville}
                  </p>
                  <p className="text-xs text-gray-700">
                    {m.register_fields_department_label()}{' '}
                    {form.state.values.departementCode} —{' '}
                    {form.state.values.departementLibelle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetAddress}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {m.register_fields_address_modify()}
                </button>
              </div>
            </div>
          ) : (
            <AddressAutocomplete
              label={m.register_fields_address()}
              placeholder={m.register_fields_address_placeholder()}
              loadingLabel={m.register_fields_address_loading()}
              emptyLabel={m.register_fields_address_no_results()}
              value={addressLabel}
              onChange={(text) => {
                setAddressLabel(text)
                if (backendAddressError) setBackendAddressError(null)
              }}
              onSelect={pickAddress}
              error={addressError ?? undefined}
              hint={m.register_fields_address_hint()}
              required
            />
          )}
        </div>

        {formError && (
          <div
            role="alert"
            className="rounded-xl bg-danger-light/15 border border-danger-light/40 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        )}

        <form.Subscribe selector={(s) => s.isSubmitting}>
          {(isSubmitting) => (
            <div className="mt-2 flex gap-3">
              {step > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goPrev}
                  disabled={isSubmitting}
                >
                  {m.common_back()}
                </Button>
              )}
              <Button
                type="button"
                onClick={handleAction}
                disabled={isSubmitting}
              >
                {step < STEP_SCHEMAS.length - 1
                  ? m.common_next()
                  : isSubmitting
                    ? m.common_submit_pending()
                    : m.auth_create_account()}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </AuthLayout>
  )
}
