import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarDays, Check, Clock, LogIn, MapPin, X } from 'lucide-react'
import { ApiError } from '~/lib/api'
import { login } from '~/lib/auth'
import { LoginSchema } from '~/lib/schemas'
import { parseViolations } from '~/lib/validation'
import { Field } from '~/components/Field'
import { adresseComplete, libelleJours, type PointDeVente } from '~/lib/points-de-vente'
import { m } from '~/paraglide/messages'

// Modale de prise de RDV. Si l'utilisateur n'est pas connecte, elle affiche
// d'abord une etape de connexion (formulaire reel, comme /login), puis enchaine
// sur la prise de RDV — ENTIEREMENT MOCKEE (pas d'API de reservation IDFM, et la
// donnee reelle ne contient pas d'horaire precis). Les creneaux sont generes
// localement et affiches comme « creneaux de demonstration ».

interface Props {
  point: PointDeVente
  connecte: boolean
  onConnecte: () => void
  onClose: () => void
}

interface Jour {
  cle: string
  labelJour: string
  labelDate: string
  creneaux: string[]
}

const HEURES = ['09:00', '09:30', '10:00', '11:00', '14:00', '14:30', '15:30', '16:30', '17:00']
const JOURS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

/** Genere les 7 prochains jours ouvrables (hors dimanche) avec des creneaux mockes. */
function genererJours(): Jour[] {
  const jours: Jour[] = []
  const base = new Date()
  let decalage = 1
  while (jours.length < 7) {
    const d = new Date(base)
    d.setDate(base.getDate() + decalage)
    decalage++
    if (d.getDay() === 0) continue // pas de RDV le dimanche
    // disponibilite mockee mais deterministe : un creneau sur ~3 est « pris »
    const creneaux = HEURES.filter((_, i) => (d.getDate() + i) % 3 !== 0)
    jours.push({
      cle: d.toISOString().slice(0, 10),
      labelJour: JOURS_FR[d.getDay()],
      labelDate: `${d.getDate()} ${MOIS_FR[d.getMonth()]}`,
      creneaux,
    })
  }
  return jours
}

const FIELDS = ['email', 'password'] as const
type FieldKey = (typeof FIELDS)[number]

export function PriseRdvModal({ point, connecte: dejaConnecte, onConnecte, onClose }: Props) {
  const [connecte, setConnecte] = useState(dejaConnecte)

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Prendre rendez-vous — ${point.name}`}
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-dark/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tete */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-200 p-5">
          <div>
            <h2 className="font-heading text-lg font-bold text-dark">Prendre rendez-vous</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-700">
              <MapPin size={14} className="shrink-0 text-primary" aria-hidden="true" />
              {point.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {connecte ? (
          <EtapeRdv point={point} onClose={onClose} />
        ) : (
          <EtapeConnexion
            onConnecte={() => {
              setConnecte(true)
              onConnecte()
            }}
          />
        )}
      </div>
    </div>
  )
}

// --- Etape 1 : connexion (formulaire reel, comme /login) -------------------

function EtapeConnexion({ onConnecte }: { onConnecte: () => void }) {
  const [form, setForm] = useState<Record<FieldKey, string>>({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  function update(key: FieldKey, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }))
    if (formError) setFormError(null)
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
      onConnecte()
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
    <div className="flex flex-col gap-4 overflow-y-auto p-5">
      <div className="flex items-start gap-3 rounded-xl bg-blue-pale p-3">
        <LogIn size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-dark">Connectez-vous pour réserver</p>
          <p className="mt-0.5 text-xs text-gray-700">
            Un compte est nécessaire pour prendre rendez-vous en point de vente.
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field
          label={m.register_fields_email()}
          type="email"
          autoComplete="email"
          placeholder={m.register_fields_email_placeholder()}
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
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
          error={fieldErrors.password}
        />
        {formError && (
          <div
            role="alert"
            className="rounded-xl border border-danger-light/40 bg-danger-light/15 px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-focus px-4 py-3 font-semibold text-white transition hover:bg-focus/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? m.login_signing_in() : m.auth_sign_in()}
        </button>
      </form>

      <p className="text-center text-xs text-gray-500">
        {m.login_no_account_yet()}{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          {m.login_create_account_link()}
        </Link>
      </p>
    </div>
  )
}

// --- Etape 2 : prise de RDV (mockee) ---------------------------------------

function EtapeRdv({ point, onClose }: { point: PointDeVente; onClose: () => void }) {
  const jours = useMemo(genererJours, [])
  const [jourActif, setJourActif] = useState(0)
  const [creneau, setCreneau] = useState<string | null>(null)
  const [confirme, setConfirme] = useState(false)

  const jour = jours[jourActif]

  if (confirme) {
    return (
      <div className="flex flex-col items-center gap-3 p-8 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <Check size={28} className="text-success" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-lg font-semibold text-dark">Rendez-vous confirmé</h3>
        <p className="text-sm text-gray-700">
          {jour.labelJour} {jour.labelDate} à <strong>{creneau}</strong>
          <br />
          {point.name} — {adresseComplete(point)}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-2 w-full rounded-xl bg-focus px-4 py-3 font-semibold text-white transition hover:bg-focus/90"
        >
          Terminer
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto p-5">
      <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
        <CalendarDays size={13} aria-hidden="true" />
        {libelleJours(point.jours)}
      </p>

      {/* Choix du jour */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {jours.map((j, i) => (
          <button
            key={j.cle}
            type="button"
            onClick={() => {
              setJourActif(i)
              setCreneau(null)
            }}
            className={`flex shrink-0 flex-col items-center rounded-xl border px-3 py-2 text-center transition ${
              i === jourActif
                ? 'border-primary bg-blue-pale text-primary'
                : 'border-gray-200 text-gray-700 hover:border-primary/50'
            }`}
          >
            <span className="text-xs capitalize">{j.labelJour}</span>
            <span className="text-sm font-semibold">{j.labelDate}</span>
          </button>
        ))}
      </div>

      {/* Creneaux */}
      <p className="mb-2 mt-4 flex items-center gap-1.5 text-sm font-medium text-dark">
        <Clock size={15} className="text-primary" aria-hidden="true" />
        Créneaux disponibles
      </p>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {jour.creneaux.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setCreneau(h)}
            className={`rounded-lg border px-2 py-2 text-sm font-medium transition ${
              creneau === h
                ? 'border-focus bg-focus text-white'
                : 'border-gray-200 text-dark hover:border-primary hover:bg-blue-pale'
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!creneau}
        onClick={() => setConfirme(true)}
        className="mt-4 w-full rounded-xl bg-focus px-4 py-3 font-semibold text-white transition hover:bg-focus/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {creneau ? `Confirmer le rendez-vous à ${creneau}` : 'Choisissez un créneau'}
      </button>
    </div>
  )
}
