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
import type {
  GroupeStatutReclamation,
  ReclamationCounts,
  ReclamationDetailDto,
  ReclamationListDto,
  ReclamationResumeDto,
} from '~/lib/types/reclamation'
import type { CategorieReclamation, Reclamation, StatutReclamation } from '~/lib/sav'

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
  nomClient?: string
  numeroDossier?: string
  page?: number
  pageSize?: number
}

export function getDossiers(params: GetDossiersParams = {}): Promise<DossierListResponse> {
  const query = new URLSearchParams()
  if (params.statut) query.set('statut', params.statut)
  if (params.nomClient) query.set('nomClient', params.nomClient)
  if (params.numeroDossier) query.set('numeroDossier', params.numeroDossier)
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

export function getDossierCounts(params: { nomClient?: string; numeroDossier?: string } = {}): Promise<DossierCounts> {
  const query = new URLSearchParams()
  if (params.nomClient) query.set('nomClient', params.nomClient)
  if (params.numeroDossier) query.set('numeroDossier', params.numeroDossier)
  const qs = query.toString()
  return apiFetch(`/dossiers/counts${qs ? `?${qs}` : ''}`)
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

/**
 * Change le statut d'un dossier (boutons "Valider/Rejeter le dossier" cote
 * backoffice). codeStatut doit etre un code du referentiel statut_dossier
 * (VALIDE, REJETE, INCOMPLET, ...). L'historique est mis a jour cote backend.
 */
export function changerStatutDossier(
  idDossier: number | string,
  codeStatut: 'VALIDE' | 'REJETE' | 'INCOMPLET',
): Promise<DossierDetail> {
  return apiFetch(`/dossiers/${idDossier}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ codeStatut }),
  })
}

/**
 * Active un dossier VALIDE : passe a ACTIF avec la date de debut choisie par
 * l'agent. La date de fin est calculee cote backend selon la periodicite du
 * type d'abonnement (annuel = +1 an, mensuel = +1 mois, etc.).
 */
export function activerDossier(
  idDossier: number | string,
  dateDebutDroits: string,
): Promise<DossierDetail> {
  return apiFetch(`/dossiers/${idDossier}/activer`, {
    method: 'POST',
    body: JSON.stringify({ dateDebutDroits }),
  })
}

/**
 * Ajoute une nouvelle piece sur un dossier. Endpoint unifie : le backend
 * detecte le role (agent / client) et applique les regles ad hoc.
 * Upload multipart. 409 si une piece du meme type existe deja.
 */
export async function ajouterPiece(
  idDossier: number | string,
  fichier: File,
  codeTypePiece: string,
): Promise<PieceJustificative> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', fichier)
  formData.append('codeTypePiece', codeTypePiece)
  const response = await fetch(`${API_URL}/dossiers/${idDossier}/pieces/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
    body: formData,
  })
  if (!response.ok) {
    let body: unknown
    try { body = await response.json() } catch { body = undefined }
    throw new ApiError(response.status, `${response.status} ${response.statusText}`, body)
  }
  return (await response.json()) as PieceJustificative
}

/**
 * Remplace le fichier d'une piece existante. Endpoint unifie : le backend
 * detecte le role (agent / client) via le JWT et applique les regles ad hoc
 * (statut autorise, ownership pour un client, flag modifieParAgent).
 */
export async function remplacerFichierPiece(
  idDossier: number | string,
  idPiece: number,
  fichier: File,
): Promise<PieceJustificative> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', fichier)
  const response = await fetch(`${API_URL}/dossiers/${idDossier}/pieces/${idPiece}/fichier`, {
    method: 'PUT',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
    body: formData,
  })
  if (!response.ok) {
    let body: unknown
    try { body = await response.json() } catch { body = undefined }
    throw new ApiError(response.status, `${response.status} ${response.statusText}`, body)
  }
  return (await response.json()) as PieceJustificative
}

export interface TypeAbonnement {
  code: string
  libelle: string
  categorie: string | null
  periodicite: string
  tarifPlein: number | null
  description: string | null
  transports: string[]
  zones: string[]
}

export function getAbonnements(): Promise<TypeAbonnement[]> {
  return apiFetch('/referentiel/abonnements')
}

// ─── Reclamations (SAV) ───────────────────────────────────────────────────

// Le statut fin du backend (7 valeurs) est regroupe cote API en 4 groupes ;
// la vue client n'expose que ces 4 etats.
const STATUT_CLIENT_PAR_GROUPE: Record<GroupeStatutReclamation, StatutReclamation> = {
  ouvert: 'OUVERT',
  en_cours: 'EN_COURS',
  resolu: 'RESOLU',
  ferme: 'FERME',
}

function reclamationDepuisResume(dto: ReclamationResumeDto): Reclamation {
  return {
    id: String(dto.id),
    reference: dto.reference,
    categorie: dto.codeCategorie as CategorieReclamation,
    objet: dto.objet,
    dateCreation: dto.dateCreation,
    dateMiseAJour: dto.dateMiseAJour,
    statut: STATUT_CLIENT_PAR_GROUPE[dto.groupeStatut],
    messages: [],
  }
}

function reclamationDepuisDetail(dto: ReclamationDetailDto): Reclamation {
  return {
    ...reclamationDepuisResume(dto),
    messages: dto.messages.map((msg, i) => ({
      id: `${dto.id}-${i}`,
      auteur: msg.auteur,
      contenu: msg.contenu,
      date: msg.date,
    })),
  }
}

/** Suivi client : reclamations de l'utilisateur connecte (sans le fil de messages). */
export async function getMesReclamations(): Promise<Reclamation[]> {
  const data = await apiFetch<ReclamationListDto>('/reclamations/mes')
  return data.reclamations.map(reclamationDepuisResume)
}

/** Detail client (avec le fil de messages), restreint au proprietaire cote backend. */
export async function getReclamation(id: number | string): Promise<Reclamation> {
  const dto = await apiFetch<ReclamationDetailDto>(`/reclamations/${id}`)
  return reclamationDepuisDetail(dto)
}

export async function creerReclamation(input: {
  codeCategorie: string
  objet: string
  description: string
}): Promise<Reclamation> {
  const dto = await apiFetch<ReclamationDetailDto>('/reclamations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return reclamationDepuisDetail(dto)
}

export async function repondreReclamation(id: number | string, contenu: string): Promise<Reclamation> {
  const dto = await apiFetch<ReclamationDetailDto>(`/reclamations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ contenu }),
  })
  return reclamationDepuisDetail(dto)
}

// — Backoffice (agents) : DTO bruts, statut fin conserve —

export interface GetReclamationsParams {
  statut?: GroupeStatutReclamation
  nomClient?: string
  reference?: string
  page?: number
  pageSize?: number
}

export function getReclamations(params: GetReclamationsParams = {}): Promise<ReclamationListDto> {
  const query = new URLSearchParams()
  if (params.statut) query.set('statut', params.statut)
  if (params.nomClient) query.set('nomClient', params.nomClient)
  if (params.reference) query.set('reference', params.reference)
  if (params.page !== undefined) query.set('page', String(params.page))
  if (params.pageSize !== undefined) query.set('pageSize', String(params.pageSize))
  const qs = query.toString()
  return apiFetch(`/reclamations${qs ? `?${qs}` : ''}`)
}

export function getReclamationCounts(
  params: { nomClient?: string; reference?: string } = {},
): Promise<ReclamationCounts> {
  const query = new URLSearchParams()
  if (params.nomClient) query.set('nomClient', params.nomClient)
  if (params.reference) query.set('reference', params.reference)
  const qs = query.toString()
  return apiFetch(`/reclamations/counts${qs ? `?${qs}` : ''}`)
}

export function getReclamationDetail(id: number | string): Promise<ReclamationDetailDto> {
  return apiFetch(`/reclamations/${id}`)
}

export function repondreReclamationAgent(
  id: number | string,
  contenu: string,
): Promise<ReclamationDetailDto> {
  return apiFetch(`/reclamations/${id}/messages`, {
    method: 'POST',
    body: JSON.stringify({ contenu }),
  })
}

/** Change le statut (valeur fine : ouvert, en_cours, en_attente_*, resolu, ferme, reouvert). */
export function changerStatutReclamation(
  id: number | string,
  statut: string,
): Promise<ReclamationDetailDto> {
  return apiFetch(`/reclamations/${id}/statut`, {
    method: 'PATCH',
    body: JSON.stringify({ statut }),
  })
}

/** Assigne la reclamation a l'agent connecte. */
export function assignerReclamation(id: number | string): Promise<ReclamationDetailDto> {
  return apiFetch(`/reclamations/${id}/assigner`, { method: 'POST' })
}

