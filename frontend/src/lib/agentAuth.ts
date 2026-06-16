import { apiFetch, clearToken, getToken, setToken } from './api'
import type { TokenResponse } from './auth'

export interface AgentMeResponse {
  id: number
  email: string
  nom: string
  prenom: string
}

export function isAuthenticated(): boolean {
  return getToken() !== null
}

export async function agentLogin(email: string, password: string): Promise<TokenResponse> {
  const token = await apiFetch<TokenResponse>('/auth/agent/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setToken(token.accessToken)
  return token
}

export function logout(): void {
  clearToken()
}

export function agentMe(): Promise<AgentMeResponse> {
  return apiFetch<AgentMeResponse>('/auth/agent/me')
}
