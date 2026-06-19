import React from 'react'
import { Link } from '@tanstack/react-router'
import { CalendarDays, Clock, Wallet, ArrowRight } from 'lucide-react'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { m } from '~/paraglide/messages'
import type { DossierDashboard, TransportMode, ZoneNavigo } from '~/lib/dashboard'

/* ─── Helpers ─────────────────────────────────────────────────────────── */

function formatDate(iso: string | null): string {
  if (!iso) return '-'
  const [y, mo, d] = iso.split('-')
  return `${d}/${mo}/${y}`
}

function formatMontant(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

function isWithin90Days(iso: string | null): boolean {
  if (!iso) return false
  const end = new Date(iso)
  const now = new Date()
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 90
}

/* ─── Transport SVG icons (officiels IDF Mobilités) ──────────────────── */

function IconMetro() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 284 284" className="h-7 w-7" aria-label="Métro" role="img">
      <circle cx="142" cy="142" r="133" fill="#fff" stroke="#0A0082" strokeWidth="18"/>
      <path fill="#0A0082" d="M212.25,205.15V81.5c0-7.09-3.9-14.53-15.6-14.53-8.85,0-12.4,3.9-16.29,11.69l-38.27,79.73h-.35L103.11,78.66C99.21,70.87,95.67,67,86.81,67,75.12,67,71.22,74.41,71.22,81.5V205.15c0,6.74,5.32,10.64,11.7,10.64,5.66,0,12-3.9,12-10.64V113h.36L130.4,184.6c2.47,5,5.67,7.8,11.34,7.8s8.85-2.84,11.33-7.8L188.15,113h.36v92.12c0,6.74,6.37,10.64,12.05,10.64,6.37,0,11.69-3.9,11.69-10.64"/>
    </svg>
  )
}

function IconRer() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" className="h-7 w-7" aria-label="RER" role="img">
      <path fill="#0A0082" d="M80.2,0C36,0,0,36,0,80.4C0,124.2,36,160,80.2,160c44.2,0,79.8-35.4,79.8-79.6C160,36,122.8,0,80.2,0z M80.2,149c-38,0-69.2-30.8-69.2-68.6c0-38.2,31.2-69.6,69.2-69.6c37.8,0,68.8,31.6,68.8,69.6C149,118,118,149,80.2,149z"/>
      <path fill="#0A0082" d="M127.8,83c5.2-2.6,9.6-7.2,9.6-15.4c0-10.8-8-15.8-15.8-15.8h-15c-2.8,0-4.4,2.2-4.4,4.6v47c0,2.8,2.8,4.2,5.4,4.2c3,0,5.4-1.4,5.4-4.2V85.2h4.6l9,20.2c0.8,1.6,2.2,2.2,3.8,2.2c3.2,0,7.8-3,6-6.6L127.8,83z M116.2,77.2H113V61h3.8c5,0,9.4,2.2,9.4,7.8C126.2,75.6,120,77.2,116.2,77.2z"/>
      <path fill="#0A0082" d="M96.8,102.4c0,2.2-1.6,5-4.4,5H71.8c-2.6,0-5.4-1.4-5.4-4.2V56.4c0-2.4,1.6-4.6,4.4-4.6h20.4c2.8,0,4.4,2.6,4.4,5c0,2.2-1.6,5-4.4,5h-14v12.6h12.6c2.8,0,4.4,2.2,4.4,4.6c0,2.2-1.6,4.6-4.4,4.6H77.2v13.8h15.2C95.2,97.4,96.8,100,96.8,102.4z"/>
      <path fill="#0A0082" d="M50.4,83c5.2-2.6,9.6-7.2,9.6-15.4c0-10.8-8-15.8-15.8-15.8h-15c-2.8,0-4.4,2.2-4.4,4.6l0,47c0,2.8,2.8,4.2,5.4,4.2c3,0,5.4-1.4,5.4-4.2V85.2h4.6l9,20.2c0.8,1.6,2.2,2.2,3.8,2.2c3.2,0,7.8-3,6-6.6L50.4,83z M38.8,77.2h-3.2l0-16.2l3.8,0c5,0,9.4,2.2,9.4,7.8C48.8,75.6,42.6,77.2,38.8,77.2z"/>
    </svg>
  )
}

function IconTrain() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.46 283.46" className="h-7 w-7" aria-label="Train" role="img">
      <rect width="265.015" height="265.015" rx="54.565" x="9.2225" y="9.2225" fill="#FFF" stroke="#25303B" strokeWidth="18.445"/>
      <path fill="#25303B" d="M183.87,204.6a13.27,13.27,0,0,0,1.67-1.29c5.09-4.13,9.85-10.45,13.31-20.25,4.83-13.73,8.24-26,9.18-41.12,1.31-18.6-6.35-47.53-11.43-61l-1.77-4.75c-1.09-3-5.26-9.47-12.65-17.18-6.36-6.62-12.47-7.11-21.77-7.11H122.65c-9.3,0-15.4.49-21.77,7.11-7.4,7.68-11.57,14.15-12.65,17.18l-1.78,4.78C81.37,94.41,73.72,123.34,75,142c.94,15.06,4.36,27.31,9.21,41.09,3.45,9.82,8.2,16.12,13.3,20.25a16.88,16.88,0,0,0,1.69,1.27l-27.5,30.58a6.87,6.87,0,0,0,0,9,5.31,5.31,0,0,0,8.06,0l9.5-10.54H193.8l9.48,10.54a5.32,5.32,0,0,0,8.07,0,6.89,6.89,0,0,0,0-9Zm-9.23-11.15a9.44,9.44,0,1,1,9.45-9.45,9.46,9.46,0,0,1-9.45,9.45M89.16,132.9c-5.77,0,3.3-50.66,7.43-50.66h88.85c4.49,0,15,50.66,8,50.66ZM98.78,184a9.45,9.45,0,1,1,9.45,9.45A9.44,9.44,0,0,1,98.78,184m1.92,36.9,10.12-11.25a55.65,55.65,0,0,0,12.8,1.13h35.82a55.57,55.57,0,0,0,12.79-1.13l10.13,11.25Z"/>
    </svg>
  )
}

function IconTramway() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 283.46 283.46" className="h-7 w-7" aria-label="Tramway" role="img">
      <path fill="#FFF" d="M0,9.21h283.46v265.04H0z"/>
      <rect fill="#25303B" width="283.46" height="18.43" rx="9.21"/>
      <rect fill="#25303B" width="283.46" height="18.43" rx="9.21" y="265.04"/>
      <path fill="#25303B" d="M28.35,212.6h185.7a41.55,41.55,0,0,0,37.54-23.41,35.42,35.42,0,0,0,3.17-20.56,111.89,111.89,0,0,0-28.41-60.39,27.67,27.67,0,0,0-20.43-9h-98L128.47,82.3a5,5,0,0,0,0-7.66L92.33,45a3.21,3.21,0,0,0-4.52.44l-2,2.48a3.22,3.22,0,0,0,.44,4.53L118,78.47,92.72,99.21H28.35V112H69.59a2,2,0,0,1,2,2V168.8a2,2,0,0,1-2,2H28.35Zm188.48-95.88a99.3,99.3,0,0,1,22.94,41.9c1.77,6.7-2.36,12.17-9.3,12.17H171.35a2,2,0,0,1-2-2V114a2,2,0,0,1,2-2h34.57a14.79,14.79,0,0,1,10.91,4.75m-62.2,83.12H128.84a2,2,0,0,1-2-2V114a2,2,0,0,1,2-2h25.79a2,2,0,0,1,2,2v83.91a2,2,0,0,1-2,2M86.31,112h25.8a2,2,0,0,1,2,2v83.91a2,2,0,0,1-2,2H86.31a2,2,0,0,1-2-2V114a2,2,0,0,1,2-2M251.15,235.84H28.35v-11.9h222.8a4,4,0,0,1,4,4v4a4,4,0,0,1-4,4"/>
    </svg>
  )
}

function IconBus() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" className="h-7 w-7" aria-label="Bus" role="img">
      <path fill="#0A0082" d="M51.2,78.2V78c4-2,8.8-5.8,8.8-12.6c0-9.2-8-13.6-15.8-13.6h-15c-2.8,0-4.4,2.2-4.4,4.6v46.8c0,2.8,2.8,4.2,5.4,4.2h14.2c8.6,0,16.6-4.6,16.6-16C61,82.2,54.6,78.8,51.2,78.2z M35.6,61h4.2c4.8,0,9,1.6,9,7c0,5.2-4.4,7-9,7h-4.2V61z M41,98.2h-4.8V82.6H41c4,0,9.4,1.4,9.4,7.6C50.4,95.6,47.4,98.2,41,98.2z"/>
      <path fill="#0A0082" d="M137.8,91c0,10.4-8,17-17.8,17c-3.8,0-8-1-10.4-2.2c-2.6-1.2-4.2-2.6-3.2-6c1-3.2,2.6-5,5.6-3.6c1.8,0.8,5.2,2,8,2c3.6,0,7.2-1.8,7.2-5.6c0-3-1.8-5.2-4.6-6.8l-4.6-2.6c-6.4-3.6-10.4-8-10.4-15.8c0-10,7.8-16.2,17.2-16.2c3.4,0,6.8,0.8,9.2,2s3.8,2.4,2.8,5.8c-0.8,3-2.6,4.8-5.4,3.4c-1.8-0.8-4.2-1.8-6.8-1.8c-3.8,0-6.4,2.2-6.4,5.4c0,2.8,2.2,5,4.8,6.4l4.4,2.4C133.2,78,137.8,82.8,137.8,91z"/>
      <path fill="#0A0082" d="M102.8,55.8V89c0,12.8-7.2,19-18,19c-12,0-18.6-6-18.6-19.2v-33c0-2.8,2.6-4.2,5.6-4.2c2.6,0,5.6,1.4,5.6,4.2v31.8c0,6.6,2.4,10.6,7.4,10.6C90,98.2,92,94,92,87.6V55.8c0-2.8,2.6-4.2,5.4-4.2C100,51.6,102.8,53,102.8,55.8z"/>
      <path fill="#0A0082" d="M80.2,0C36,0,0,36,0,80.4C0,124.2,36,160,80.2,160c44.2,0,79.8-35.4,79.8-79.6C160,36,122.8,0,80.2,0z M80.2,149c-38,0-69.2-30.8-69.2-68.6c0-38.2,31.2-69.6,69.2-69.6c37.8,0,68.8,31.6,68.8,69.6C149,118,118,149,80.2,149z"/>
    </svg>
  )
}

const TRANSPORT_ICON: Record<TransportMode, () => React.ReactElement> = {
  METRO: IconMetro,
  RER: IconRer,
  TRAIN: IconTrain,
  TRAMWAY: IconTramway,
  BUS: IconBus,
}

const TRANSPORT_LABEL: Record<TransportMode, string> = {
  METRO: 'Métro', RER: 'RER', TRAIN: 'Train', TRAMWAY: 'Tramway', BUS: 'Bus',
}

/* ─── Zone badges (carrés arrondis) ──────────────────────────────────── */

const ZONE_COLORS: Record<ZoneNavigo, string> = {
  Z1: 'bg-blue-600',
  Z2: 'bg-green-500',
  Z3: 'bg-yellow-400',
  Z4: 'bg-orange-400',
  Z5: 'bg-red-400',
}
const ZONE_LABEL: Record<ZoneNavigo, string> = { Z1: '1', Z2: '2', Z3: '3', Z4: '4', Z5: '5' }

/* ─── Navigo card visual ──────────────────────────────────────────────── */

function NavigoCardVisual({ libelle }: { libelle: string }) {
  return (
    <img
      src="/navigo-card-transparent.png"
      alt={`Carte Navigo — ${libelle}`}
      className="h-36 w-24 shrink-0 rounded-xl object-contain"
    />
  )
}

/* ─── Main component ──────────────────────────────────────────────────── */

function isFutureDate(iso: string | null): boolean {
  if (!iso) return false
  const target = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return target.getTime() > today.getTime()
}

const STATUT_I18N: Record<string, () => string> = {
  BROUILLON:           m.dashboard_statut_brouillon,
  EN_VERIFICATION:     m.dashboard_statut_en_verification,
  INCOMPLET:           m.dashboard_statut_incomplet,
  EN_ATTENTE_PAIEMENT: m.dashboard_statut_en_attente_paiement,
  ACTIF:               m.dashboard_statut_actif,
  VALIDE:              m.dashboard_statut_actif,
  EXPIRE:              m.dashboard_statut_expire,
  REJETE:              m.dashboard_statut_rejete,
  RESILIE:             m.dashboard_statut_resilie,
}

export function DossierCard({ dossier }: { dossier: DossierDashboard }) {
  const showRenewal = dossier.dateRenouvellement !== null
    && dossier.statut.categorie === 'en_cours'
    && isWithin90Days(dossier.dateFinDroits)
  const estActifOuValide = dossier.statut.code === 'ACTIF' || dossier.statut.code === 'VALIDE'
  const aDesDroitsConnus = estActifOuValide
    && (dossier.dateDebutDroits !== null || dossier.dateFinDroits !== null)
  const actifFutur = dossier.statut.code === 'ACTIF' && isFutureDate(dossier.dateDebutDroits)
  const libelleStatut = actifFutur
    ? m.dossier_card_active_from({ date: formatDate(dossier.dateDebutDroits) })
    : (STATUT_I18N[dossier.statut.code]?.() ?? dossier.statut.libelle)

  return (
    <article
      className="overflow-hidden rounded-2xl border border-primary/40 bg-white shadow-sm"
      aria-label={`${dossier.typeAbonnementLibelle} — ${libelleStatut}`}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between border-b border-blue-100 px-5 py-3"
        style={{ background: 'linear-gradient(to right, #f0f4ff, #eef2fb)' }}
      >
        <StatusBadge
          libelle={libelleStatut}
          categorie={dossier.statut.code === 'INCOMPLET' ? 'rejete' : dossier.statut.categorie as any}
        />
        <span className="text-xs text-gray-500 sm:text-sm">
          N°&nbsp;<span className="font-mono font-semibold text-gray-700">{dossier.numeroDossier}</span>
        </span>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col gap-5 p-4 sm:flex-row sm:gap-6 sm:p-5">
        <div className="hidden sm:block">
          <NavigoCardVisual libelle={dossier.typeAbonnementLibelle} />
        </div>

        {/* Middle */}
        <div className="flex flex-1 flex-col gap-3 sm:gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-gray-900 sm:text-xl">{dossier.typeAbonnementLibelle}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {m.dashboard_for_holder()}{' '}
              <span className="font-semibold text-gray-700">
                {dossier.beneficiaireNomComplet
                  ? dossier.beneficiaireNomComplet
                  : `${dossier.porteurIdentite.prenom} ${dossier.porteurIdentite.nom}`}
              </span>
            </p>
            <p className="text-sm text-gray-500">
              {m.dashboard_paid_by()}{' '}
              <span className="font-semibold text-gray-700">
                {dossier.payeurIdentite.prenom} {dossier.payeurIdentite.nom}
              </span>
            </p>
          </div>

          {dossier.transports.length > 0 && (
            <div>
              <p className="mb-2.5 text-xs font-semibold text-gray-600">{m.dossier_card_transports_included()}</p>
              <div className="flex flex-wrap gap-4">
                {dossier.transports.map((t) => {
                  const Icon = TRANSPORT_ICON[t]
                  return (
                    <div key={t} className="flex flex-col items-center gap-1">
                      <Icon />
                      <span className="text-[11px] text-gray-500">{TRANSPORT_LABEL[t]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {dossier.zones.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-gray-600">{m.dossier_card_zones_covered()}</p>
              <div className="flex items-center gap-1.5">
                {dossier.zones.map((z) => (
                  <span
                    key={z}
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white ${ZONE_COLORS[z]}`}
                    aria-label={m.dossier_card_zone_aria({ zone: ZONE_LABEL[z] })}
                  >
                    {ZONE_LABEL[z]}
                  </span>
                ))}
                <span className="ml-1.5 text-xs text-gray-500">{m.dossier_card_region_idf()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex shrink-0 flex-col gap-3 sm:w-56 sm:gap-4">
          {aDesDroitsConnus && (
            <div className="flex items-start gap-2.5">
              <CalendarDays size={16} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-gray-700">{m.dossier_card_validity_period()}</p>
                <p className="mt-0.5 text-sm text-gray-600">
                  {dossier.dateFinDroits
                    ? m.dossier_card_period_range({ start: formatDate(dossier.dateDebutDroits), end: formatDate(dossier.dateFinDroits) })
                    : m.dossier_card_period_open({ start: formatDate(dossier.dateDebutDroits) })}
                </p>
              </div>
            </div>
          )}

          {dossier.dateRenouvellement && dossier.statut.categorie === 'en_cours' && (
            <div className="flex items-start gap-2.5">
              <Clock size={16} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
              <div>
                <p className="text-xs font-semibold text-gray-700">{m.dossier_card_next_renewal()}</p>
                <p className="mt-0.5 text-sm text-gray-600">{formatDate(dossier.dateRenouvellement)}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <Wallet size={16} className="mt-0.5 shrink-0 text-gray-400" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-gray-700">{m.dossier_card_price()}</p>
              <p className="mt-0.5 text-sm text-gray-600">{formatMontant(dossier.montantTotal)}</p>
            </div>
          </div>

          <Link
            to="/dossier/$id"
            params={{ id: String(dossier.idDossier) }}
            aria-label={m.dashboard_see_link_aria({ name: dossier.typeAbonnementLibelle })}
            className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {m.dossier_card_manage_cta()}
            <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      </div>

      {/* ── Footer — toujours présent, texte uniquement si ≤ 90 jours ── */}
      <div
        className="flex min-h-[44px] items-center gap-3 border-t border-blue-100 px-5 py-3"
        style={{ background: '#eef4fd' }}
      >
        {showRenewal && (
          <>
            <svg viewBox="0 0 20 20" className="h-5 w-5 shrink-0" aria-hidden="true">
              <circle cx="10" cy="10" r="10" fill="#1972d2"/>
              <rect x="9" y="9" width="2" height="6" rx="1" fill="white"/>
              <circle cx="10" cy="6.5" r="1.2" fill="white"/>
            </svg>
            <p className="text-sm text-gray-700">
              {m.dossier_card_renew_reminder_before()}{' '}
              <span className="font-medium">{formatDate(dossier.dateRenouvellement)}</span>{' '}
              {m.dossier_card_renew_reminder_after()}
            </p>
          </>
        )}
      </div>
    </article>
  )
}
