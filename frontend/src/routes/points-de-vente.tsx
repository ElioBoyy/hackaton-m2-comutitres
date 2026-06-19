import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Crosshair, LocateFixed, LogOut, MapPin, Menu, Search } from 'lucide-react'
import { CartePointsDeVente } from '~/components/CartePointsDeVente'
import { PriseRdvModal } from '~/components/PriseRdvModal'
import { UserSidebar } from '~/components/UserSidebar'
import { LanguageSwitcher } from '~/components/LanguageSwitcher'
import { isAuthenticated, logout, me, type MeResponse } from '~/lib/auth'
import { m } from '~/paraglide/messages'
import {
  adresseComplete,
  centreBornes,
  chargerPointsDeVente,
  dansBornes,
  distanceKm,
  formaterDistance,
  libelleJours,
  obtenirPosition,
  plusProches,
  type Bornes,
  type Coordonnees,
  type PointDeVente,
  type TypePointDeVente,
} from '~/lib/points-de-vente'

export const Route = createFileRoute('/points-de-vente')({
  component: PointsDeVentePage,
})

type FiltreType = 'tous' | TypePointDeVente
type PointAffiche = PointDeVente & { distanceKm?: number }

const PLAFOND_LISTE = 50

function PointsDeVentePage() {
  const navigate = useNavigate()
  const [authentifie, setAuthentifie] = useState(false)
  const [utilisateur, setUtilisateur] = useState<MeResponse | null>(null)
  const [sidebarOuverte, setSidebarOuverte] = useState(false)
  const [points, setPoints] = useState<PointDeVente[]>([])
  const [chargement, setChargement] = useState(true)
  const [erreurData, setErreurData] = useState<string | null>(null)

  const [recherche, setRecherche] = useState('')
  const [filtreType, setFiltreType] = useState<FiltreType>('tous')
  const [position, setPosition] = useState<Coordonnees | null>(null)
  const [geoEnCours, setGeoEnCours] = useState(false)
  const [geoErreur, setGeoErreur] = useState<string | null>(null)
  const [selectionId, setSelectionId] = useState<string | null>(null)
  const [pointRdv, setPointRdv] = useState<PointDeVente | null>(null)
  const [bornes, setBornes] = useState<Bornes | null>(null)

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthentifie(true)
      me().then(setUtilisateur).catch(() => {})
    }
    chargerPointsDeVente()
      .then(setPoints)
      .catch((e) => setErreurData((e as Error).message))
      .finally(() => setChargement(false))
  }, [])

  // Liste affichee : filtree par type, puis par cadre visible de la carte
  // (sauf si une recherche est active — la recherche reste globale pour trouver
  // partout). Triee par proximite si on a la position, sinon par distance au
  // centre de la vue. Plafonnee a PLAFOND_LISTE pour garder le DOM leger.
  const { items: liste, total: totalVue } = useMemo<{ items: PointAffiche[]; total: number }>(() => {
    let base = points
    if (filtreType !== 'tous') base = base.filter((p) => p.type === filtreType)
    const q = recherche.trim().toLowerCase()
    if (q) {
      base = base.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.ville.toLowerCase().includes(q) ||
          p.cp.includes(q) ||
          p.adresse.toLowerCase().includes(q),
      )
    } else if (bornes) {
      base = base.filter((p) => dansBornes(p, bornes))
    }
    const total = base.length
    let items: PointAffiche[]
    if (position) {
      items = plusProches(base, position, PLAFOND_LISTE)
    } else if (bornes && !q) {
      const centre = centreBornes(bornes)
      items = [...base]
        .sort((a, b) => distanceKm(centre, a) - distanceKm(centre, b))
        .slice(0, PLAFOND_LISTE)
    } else {
      items = base.slice(0, PLAFOND_LISTE)
    }
    return { items, total }
  }, [points, filtreType, recherche, position, bornes])

  async function localiser() {
    setGeoEnCours(true)
    setGeoErreur(null)
    try {
      setPosition(await obtenirPosition())
    } catch (e) {
      setGeoErreur((e as Error).message)
    } finally {
      setGeoEnCours(false)
    }
  }

  function demanderRdv(point: PointDeVente) {
    // Ouvre la modale pour tous : si pas connecte, elle demande la connexion
    // puis enchaine sur la prise de RDV.
    setPointRdv(point)
  }

  function onLogout() {
    logout()
    setAuthentifie(false)
    setUtilisateur(null)
    navigate({ to: '/login' })
  }

  const prenom = utilisateur?.prenom ?? ''

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <UserSidebar isOpen={sidebarOuverte} onClose={() => setSidebarOuverte(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header app */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOuverte(true)}
              aria-label={m.common_open_menu()}
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30 lg:hidden"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <h1 className="font-heading text-lg font-semibold text-gray-900">{m.pdv_title()}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            {authentifie ? (
              <>
                {prenom && (
                  <div className="hidden items-center gap-2 lg:flex">
                    <div
                      aria-hidden="true"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-focus text-sm font-semibold text-white"
                    >
                      {prenom.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {m.dashboard_hello()} {prenom}
                    </span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label={m.me_sign_out()}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <LogOut size={18} aria-hidden="true" />
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="rounded-xl bg-focus px-4 py-2 text-sm font-semibold text-white transition hover:bg-focus/90"
              >
                {m.pdv_login_cta()}
              </Link>
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
          {/* Panneau liste */}
          <aside className="flex max-h-[45vh] w-full shrink-0 flex-col border-b border-gray-200 bg-white lg:max-h-none lg:w-[400px] lg:border-b-0 lg:border-r">
            <div className="border-b border-gray-100 p-4">
              <p className="text-sm text-gray-700">
                {chargement
                  ? m.pdv_loading()
                  : recherche.trim()
                    ? m.pdv_results_count({ count: totalVue.toLocaleString(), plural: totalVue > 1 ? 's' : '' })
                    : m.pdv_zone_count({ zone: totalVue.toLocaleString(), total: points.length.toLocaleString() })}
              </p>

              {/* Recherche */}
              <div className="relative mt-3">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                  placeholder={m.pdv_search_placeholder()}
                  className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm text-dark placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Geolocalisation */}
              <button
                type="button"
                onClick={localiser}
                disabled={geoEnCours}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-primary bg-blue-pale px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-blue-soft disabled:opacity-50"
              >
                {geoEnCours ? <Crosshair size={16} className="animate-spin" /> : <LocateFixed size={16} />}
                {geoEnCours ? m.pdv_locate_loading() : m.pdv_locate_cta()}
              </button>
              {geoErreur && <p className="mt-2 text-xs text-danger">{geoErreur}</p>}
              {position && !geoErreur && (
                <p className="mt-2 text-xs text-success">{m.pdv_locate_success()}</p>
              )}

              {/* Filtres type */}
              <div className="mt-3 flex gap-2">
                {(
                  [
                    ['tous', m.pdv_filter_all()],
                    ['Guichet Navigo', m.pdv_filter_guichet()],
                    ['Commerce de proximité', m.pdv_filter_commerce()],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFiltreType(val)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      filtreType === val
                        ? 'border-focus bg-focus text-white'
                        : 'border-gray-200 text-gray-700 hover:border-primary'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto">
              {erreurData && <p className="p-4 text-sm text-danger">{m.pdv_load_error({ error: erreurData })}</p>}
              {!chargement && !erreurData && liste.length === 0 && (
                <p className="p-4 text-sm text-gray-500">{m.pdv_empty()}</p>
              )}
              <ul>
                {liste.map((p) => (
                  <li key={p.id}>
                    <article
                      className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition ${
                        selectionId === p.id ? 'bg-blue-pale' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectionId(p.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="text-sm font-semibold text-dark">{p.name}</h2>
                        {p.distanceKm !== undefined && (
                          <span className="shrink-0 rounded-full bg-blue-soft px-2 py-0.5 text-xs font-medium text-focus">
                            {formaterDistance(p.distanceKm)}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 flex items-start gap-1 text-xs text-gray-700">
                        <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
                        {adresseComplete(p)}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
                            p.type === 'Guichet Navigo'
                              ? 'bg-focus/10 text-focus'
                              : 'bg-success/10 text-success'
                          }`}
                        >
                          {p.type === 'Guichet Navigo' ? m.pdv_type_guichet() : m.pdv_type_commerce()}
                        </span>
                        <span className="text-[11px] text-gray-500">{libelleJours(p.jours)}</span>
                      </div>
                      {p.type === 'Guichet Navigo' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            demanderRdv(p)
                          }}
                          className="mt-2 flex items-center gap-1.5 rounded-lg bg-focus px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-focus/90"
                        >
                          <CalendarClock size={13} aria-hidden="true" />
                          {m.pdv_rdv_cta()}
                        </button>
                      )}
                    </article>
                  </li>
                ))}
              </ul>
              {totalVue > PLAFOND_LISTE && (
                <p className="px-4 py-3 text-xs text-gray-500">
                  {m.pdv_truncated({
                    shown: String(PLAFOND_LISTE),
                    total: totalVue.toLocaleString(),
                    hint: recherche.trim() ? m.pdv_truncated_hint_search() : m.pdv_truncated_hint_map(),
                  })}
                </p>
              )}
            </div>
          </aside>

          {/* Carte */}
          <main className="relative flex-1">
            {!chargement && points.length > 0 && (
              <CartePointsDeVente
                points={points}
                selectedId={selectionId}
                onSelect={(p) => setSelectionId(p.id)}
                userPosition={position}
                onBoundsChange={setBornes}
              />
            )}
            {/* Legende */}
            <div className="pointer-events-none absolute bottom-3 left-3 z-[500] flex flex-col gap-1 rounded-xl bg-white/90 px-3 py-2 text-xs shadow-md">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#0050aa' }} />
                {m.pdv_legend_guichet()}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full" style={{ background: '#007d44' }} />
                {m.pdv_legend_commerce()}
              </span>
            </div>
          </main>
        </div>
      </div>

      {pointRdv && (
        <PriseRdvModal
          point={pointRdv}
          connecte={authentifie}
          onConnecte={() => setAuthentifie(true)}
          onClose={() => setPointRdv(null)}
        />
      )}
    </div>
  )
}
