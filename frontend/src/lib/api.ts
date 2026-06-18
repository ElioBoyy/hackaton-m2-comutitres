/**
 * Client HTTP minimal vers le backend Spring (jegeremacartenavigo-backend).
 *
 * - Base URL configurable via la variable d'env Vite VITE_API_URL (.env).
 * - Auth stateless via header Authorization: Bearer <jwt> (aucun cookie).
 * - Possede aussi le storage du JWT : seul module qui touche a localStorage,
 *   pour que le support de stockage puisse changer sans impacter les use cases.
 */
import type {
  DossierDetail,
  DossierListResponse,
  DossierResume,
  HistoriqueEntree,
  PieceJustificative,
} from '~/lib/types/dossier'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const TOKEN_KEY: string = import.meta.env.VITE_TOKEN_KEY ?? 'jgmcn.access_token'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken()

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = undefined
    }
    throw new ApiError(
      response.status,
      `${response.status} ${response.statusText} sur ${path}`,
      body,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

/**
 * Verification de cablage : ping de l'endpoint Actuator du backend.
 * Necessite que le backend tourne (mvn spring-boot:run) sur le port 8080.
 */
export function getHealth(): Promise<{ status: string }> {
  return apiFetch('/actuator/health')
}

// --- Chat RAG en streaming (SSE) ---
// apiFetch ne gere pas le streaming : on lit le flux a la main via fetch +
// ReadableStream et on parse les evenements Server-Sent Events du backend
// (POST /api/chat/stream). Evenements : `delta` (morceau de texte) puis `fin`
// (citations + statut d'escalade) ; `erreur` en cas de probleme.

export interface ChatCitation {
  index: number
  titre: string | null
  url: string | null
  cheminSource: string
}

export interface ChatFin {
  sessionId: number
  texte: string
  citations: Array<ChatCitation>
  horsCorpus: boolean
  escalade: boolean
  referenceTicket: string | null
}

export interface StreamChatHandlers {
  onToken: (morceau: string) => void
  onDone: (fin: ChatFin) => void
  onError?: (message: string) => void
}

export interface StreamChatBody {
  sessionId?: number | null
  message: string
  canal?: string
}

export async function streamChat(
  body: StreamChatBody,
  handlers: StreamChatHandlers,
): Promise<void> {
  const token = getToken()
  const response = await fetch(`${API_URL}/api/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  if (!response.ok || !response.body) {
    throw new ApiError(response.status, `Echec du stream de chat (${response.status})`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let tampon = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    tampon += decoder.decode(value, { stream: true })
    let coupure: number
    while ((coupure = tampon.indexOf('\n\n')) >= 0) {
      const brut = tampon.slice(0, coupure)
      tampon = tampon.slice(coupure + 2)
      traiterEvenement(brut, handlers)
    }
  }
}

function traiterEvenement(brut: string, handlers: StreamChatHandlers): void {
  let evenement = 'message'
  let data = ''
  for (const ligne of brut.split('\n')) {
    if (ligne.startsWith('event:')) evenement = ligne.slice(6).trim()
    else if (ligne.startsWith('data:')) data += ligne.slice(5).trim()
  }
  if (!data) return
  if (evenement === 'delta') {
    const { t } = JSON.parse(data) as { t: string }
    if (t) handlers.onToken(t)
  } else if (evenement === 'fin') {
    handlers.onDone(JSON.parse(data) as ChatFin)
  } else if (evenement === 'erreur') {
    const { message } = JSON.parse(data) as { message?: string }
    handlers.onError?.(message ?? 'erreur inconnue')
  }
}

export interface GetDossiersParams {
  statut?: string
  page?: number
  pageSize?: number
}

/**
 * Liste des dossiers en attente de verification par un agent backoffice.
 * Endpoint pas encore implemente cote back (cf. CLAUDE.md, domaine sans controleur REST).
 */
export function getDossiers(params: GetDossiersParams = {}): Promise<DossierListResponse> {
  const query = new URLSearchParams()
  if (params.statut) query.set('statut', params.statut)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize))
  const qs = query.toString()
  return apiFetch(`/dossiers${qs ? `?${qs}` : ''}`)
}

export interface DossierCounts {
  tous: number
  enCours: number
  abouti: number
  rejete: number
  clos: number
}

export function getDossierCounts(): Promise<DossierCounts> {
  return apiFetch('/dossiers/counts')
}

/**
 * Recherche libre d'un dossier/client pour qu'un agent agisse a sa place.
 */
export function searchDossiers(q: string): Promise<DossierResume[]> {
  return apiFetch(`/dossiers/search?q=${encodeURIComponent(q)}`)
}

export function getDossierDetail(id: number | string): Promise<DossierDetail> {
  return apiFetch(`/dossiers/${id}`)
}

export function getDossierHistorique(id: number | string): Promise<{ historique: HistoriqueEntree[] }> {
  return apiFetch(`/dossiers/${id}/historique`)
}

export function validerPiece(
  idDossier: number | string,
  idPiece: number,
  valider: boolean,
  motifRejet?: string,
): Promise<PieceJustificative> {
  return apiFetch(`/dossiers/${idDossier}/pieces/${idPiece}`, {
    method: 'PATCH',
    body: JSON.stringify({ valider, motifRejet: motifRejet ?? null }),
  })
}
