import { apiFetch } from './api'

export interface AgentMeResponse {
  id: number
  email: string
  nom: string
  prenom: string
}

export function agentMe(): Promise<AgentMeResponse> {
  return apiFetch<AgentMeResponse>('/auth/agent/me')
}
