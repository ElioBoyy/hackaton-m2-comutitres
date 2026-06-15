/**
 * Client HTTP minimal vers le backend Spring (jegeremacartenavigo-backend).
 *
 * - Base URL configurable via la variable d'env Vite VITE_API_URL (.env).
 * - credentials: 'include' car le backend autorise allow-credentials sur le CORS.
 * - Aucune route ne l'appelle pour l'instant (setup "sans exemples") : c'est le
 *   point d'entree a utiliser quand vous brancherez des commandes/queries.
 */
const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

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
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
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
