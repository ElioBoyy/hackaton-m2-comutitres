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
