// Client de la Base Adresse Nationale (api-adresse.data.gouv.fr) - sans cle.
export interface BanAddress {
  label: string
  numeroEtVoie: string
  codePostal: string
  ville: string
  departementCode: string
  departementLibelle: string
}

type BanType = 'housenumber' | 'street' | 'locality' | 'municipality'

interface BanFeature {
  properties: {
    label?: string
    name?: string
    postcode?: string
    city?: string
    citycode?: string
    context?: string
    type?: BanType
  }
}

interface BanResponse {
  features: BanFeature[]
}

const ENDPOINT = 'https://api-adresse.data.gouv.fr/search/'

export async function searchAddress(query: string, signal?: AbortSignal): Promise<BanAddress[]> {
  const q = query.trim()
  if (q.length < 3) return []
  const url = `${ENDPOINT}?q=${encodeURIComponent(q)}&limit=8&autocomplete=1`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`BAN ${res.status}`)
  const data = (await res.json()) as BanResponse
  return data.features.map(toAddress).filter((a): a is BanAddress => a !== null)
}

function toAddress(feature: BanFeature): BanAddress | null {
  const p = feature.properties
  if (p.type !== 'housenumber' && p.type !== 'street') return null
  if (!p.postcode || !p.city || !p.label || !p.name) return null
  const { code, libelle } = parseContext(p.context, p.citycode, p.postcode)
  return {
    label: p.label,
    numeroEtVoie: p.name,
    codePostal: p.postcode,
    ville: p.city,
    departementCode: code,
    departementLibelle: libelle,
  }
}

// BAN context : "75, Paris, Ile-de-France". Fallback : 2 premiers caracteres
// du citycode INSEE ou du code postal.
function parseContext(
  context: string | undefined,
  citycode: string | undefined,
  postcode: string,
): { code: string; libelle: string } {
  if (context) {
    const parts = context.split(',').map((s) => s.trim())
    if (parts.length >= 2 && parts[0]) {
      return { code: parts[0], libelle: parts[1] ?? parts[0] }
    }
  }
  const fallback = (citycode ?? postcode).slice(0, 2)
  return { code: fallback, libelle: fallback }
}
