/**
 * Client HTTP minimal vers le backend Spring (jegeremacartenavigo-backend).
 *
 * - Base URL configurable via la variable d'env Vite VITE_API_URL (.env).
 * - Auth stateless via header Authorization: Bearer <jwt> (aucun cookie).
 * - Possede aussi le storage du JWT : seul module qui touche a localStorage,
 *   pour que le support de stockage puisse changer sans impacter les use cases.
 */
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
