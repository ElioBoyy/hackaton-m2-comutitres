import { apiFetch, clearToken, getToken, setToken } from './api'

export interface TokenResponse {
  accessToken: string
  expiresIn: number
  tokenType: string
}

export interface MeResponse {
  id: number
  email: string
  nom: string
  prenom: string
  dateNaissance: string
}

export interface RegisterPayload {
  email: string
  password: string
  nom: string
  prenom: string
  dateNaissance: string
  numeroEtVoie: string
  codePostal: string
  ville: string
  departementCode: string
  departementLibelle: string
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

/**
 * Lit le claim `type` ("client" | "agent") d'un JWT HS256 sans verifier la
 * signature : le backend reste la source de verite, ce decode sert uniquement
 * a brancher l'UI sur la bonne page de redirection (cf. /login vs /backoffice/login).
 */
export function getTokenType(token: string): 'client' | 'agent' | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const padded = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded.padEnd(padded.length + ((4 - (padded.length % 4)) % 4), '='))
    const claims = JSON.parse(json) as { type?: string }
    if (claims.type === 'agent' || claims.type === 'client') return claims.type
    return null
  } catch {
    return null
  }
}

export function getCurrentTokenType(): 'client' | 'agent' | null {
  const token = getToken()
  return token ? getTokenType(token) : null
}

export async function register(payload: RegisterPayload): Promise<TokenResponse> {
  const token = await apiFetch<TokenResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setToken(token.accessToken)
  return token
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const token = await apiFetch<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(token.accessToken)
  return token
}

export function logout(): void {
  clearToken()
}

export function me(): Promise<MeResponse> {
  return apiFetch<MeResponse>('/auth/me')
}
