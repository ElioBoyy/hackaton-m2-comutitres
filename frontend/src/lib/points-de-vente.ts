// Service points de vente Navigo.
//
// La SEULE donnee reelle de cette feature : le dataset open data Ile-de-France
// Mobilites « points-de-vente » (2012 points), telecharge une fois et bundle
// dans public/data/points-de-vente.json. Schema reduit aux champs utiles.
//
// Limite assumee de la source : `jours` est l'amplitude de jours d'ouverture
// telle que publiee par IDFM (ex. « Lundi-Dimanche »), null pour ~68% des
// points. Il n'y a PAS d'heure d'ouverture precise dans la donnee reelle — les
// creneaux horaires de prise de RDV sont donc mockes (cf. PriseRdvModal).

export type TypePointDeVente = 'Commerce de proximité' | 'Guichet Navigo'

export interface PointDeVente {
  id: string
  /** nom commercial du point de vente */
  name: string
  type: TypePointDeVente
  /** amplitude de jours d'ouverture publiee par IDFM, ou null si non communique */
  jours: string | null
  /** numero + voie */
  adresse: string
  cp: string
  ville: string
  lat: number
  lng: number
}

/** point de vente enrichi d'une distance (km) par rapport a une position */
export interface PointDeVenteAvecDistance extends PointDeVente {
  distanceKm: number
}

export interface Coordonnees {
  lat: number
  lng: number
}

/** bornes geographiques de la zone visible de la carte */
export interface Bornes {
  nord: number
  sud: number
  est: number
  ouest: number
}

/** vrai si le point est dans le cadre visible (pas de gestion de l'antimeridien : IDF) */
export function dansBornes(p: Coordonnees, b: Bornes): boolean {
  return p.lat <= b.nord && p.lat >= b.sud && p.lng <= b.est && p.lng >= b.ouest
}

export function centreBornes(b: Bornes): Coordonnees {
  return { lat: (b.nord + b.sud) / 2, lng: (b.est + b.ouest) / 2 }
}

const URL_DATA = '/data/points-de-vente.json'

let cache: PointDeVente[] | null = null
let chargement: Promise<PointDeVente[]> | null = null

/** Charge le dataset (mis en cache apres le premier appel). */
export function chargerPointsDeVente(): Promise<PointDeVente[]> {
  if (cache) return Promise.resolve(cache)
  if (chargement) return chargement
  chargement = fetch(URL_DATA)
    .then((res) => {
      if (!res.ok) throw new Error(`chargement points de vente: ${res.status}`)
      return res.json() as Promise<PointDeVente[]>
    })
    .then((data) => {
      cache = data
      return data
    })
    .catch((err) => {
      chargement = null
      throw err
    })
  return chargement
}

// --- Geolocalisation (reelle, via l'API navigateur) -----------------------

const RAYON_TERRE_KM = 6371

/** distance a vol d'oiseau entre deux points (formule de haversine), en km */
export function distanceKm(a: Coordonnees, b: Coordonnees): number {
  const dLat = radians(b.lat - a.lat)
  const dLng = radians(b.lng - a.lng)
  const lat1 = radians(a.lat)
  const lat2 = radians(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h))
}

function radians(deg: number): number {
  return (deg * Math.PI) / 180
}

/**
 * Demande la position de l'utilisateur via l'API Geolocation du navigateur.
 * Rejette si l'API est indisponible, refusee, ou en timeout.
 */
export function obtenirPosition(): Promise<Coordonnees> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('La géolocalisation n’est pas disponible sur cet appareil.'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(traduireErreurGeo(err)),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  })
}

function traduireErreurGeo(err: GeolocationPositionError): Error {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return new Error('Vous avez refusé l’accès à votre position.')
    case err.POSITION_UNAVAILABLE:
      return new Error('Position indisponible pour le moment.')
    case err.TIMEOUT:
      return new Error('La localisation a pris trop de temps.')
    default:
      return new Error('Impossible de vous localiser.')
  }
}

/**
 * Trie les points par distance croissante a partir d'une position et renvoie
 * les `limite` plus proches, distance (km) calculee.
 */
export function plusProches(
  points: PointDeVente[],
  position: Coordonnees,
  limite = 10,
): PointDeVenteAvecDistance[] {
  return points
    .map((p) => ({ ...p, distanceKm: distanceKm(position, p) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limite)
}

// --- Helpers d'affichage ---------------------------------------------------

export function adresseComplete(p: PointDeVente): string {
  const ligne1 = p.adresse?.trim()
  const ligne2 = [p.cp, capitaliserVille(p.ville)].filter(Boolean).join(' ')
  return [ligne1, ligne2].filter(Boolean).join(', ')
}

/** Les villes du dataset sont en MAJUSCULES — on les rend lisibles. */
export function capitaliserVille(ville: string): string {
  return ville
    .toLowerCase()
    .replace(/(^|[\s'-])([a-zàâäéèêëîïôöùûüç])/g, (_, sep, c) => sep + c.toUpperCase())
}

export function libelleJours(jours: string | null): string {
  return jours && jours.trim() ? jours : 'Horaires non communiqués'
}

export function formaterDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}
