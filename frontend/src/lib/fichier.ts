/**
 * Client pour /fichiers (cf. FichierController backend) : upload, listing et
 * lecture proxifiee des pieces justificatives sur le bucket MinIO prive.
 *
 * Aucune URL signee n'est emise : toute lecture passe par le backend, qui
 * verifie le JWT puis re-stream depuis MinIO. Le bucket reste prive cote
 * MinIO et le scope est borne par le prefixe {@code users/{idUser}/...}
 * (ou bypass pour les agents, cf. backend).
 */
import { ApiError, getToken } from '~/lib/api'

const API_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

/**
 * Categories metier d'une piece. Aligne sur l'enum {@code TypePiece} cote
 * backend (codes du referentiel TypePieceJustificative). null = upload
 * generique, l'objet est range sans semantique sous {@code users/{id}/}.
 */
export type TypePiece = 'PIECE_IDENTITE' | 'CERTIFICAT_SCOLARITE' | 'NOTIFICATION_BOURSE'

export interface FichierDeposeResponse {
  cle: string
  nomOriginal: string
  tailleOctets: number
  type: TypePiece | null
}

export interface FichierListeEntree {
  cle: string
  nomFichier: string
  type: TypePiece | null
  tailleOctets: number
  /** ISO-8601 (Instant cote backend), parsable directement par new Date(). */
  dateDepot: string
}

/**
 * Depose un fichier sur le backend (qui le pousse a son tour sur MinIO).
 * L'authentification (Bearer JWT) est obligatoire - sans token, le backend
 * renvoie 401.
 */
export async function deposerFichier(fichier: File, type?: TypePiece): Promise<FichierDeposeResponse> {
  const token = getToken()
  const formData = new FormData()
  formData.append('file', fichier)
  // Le backend range les objets typees sous users/{id}/{type-slug}/... et
  // retournera le type dans le listing pour qu'on affiche un libellé stable.
  const query = type ? `?type=${encodeURIComponent(type)}` : ''

  const response = await fetch(`${API_URL}/fichiers${query}`, {
    method: 'POST',
    headers: {
      // On ne fixe PAS Content-Type : le navigateur ajoute le boundary multipart.
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
    body: formData,
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
      `${response.status} ${response.statusText} sur /fichiers`,
      body,
    )
  }

  return (await response.json()) as FichierDeposeResponse
}

/**
 * Liste les pieces deposees par l'utilisateur connecte (filtrees cote backend
 * sur le prefixe {@code users/{idUser}/}). Retourne un tableau vide si aucune.
 */
export async function listerFichiers(): Promise<FichierListeEntree[]> {
  const token = getToken()
  const response = await fetch(`${API_URL}/fichiers`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'application/json',
    },
  })
  if (!response.ok) {
    throw new ApiError(response.status, `Echec listing /fichiers`)
  }
  return (await response.json()) as FichierListeEntree[]
}

/**
 * Recupere le contenu d'une piece via le backend (qui re-stream depuis le
 * bucket prive MinIO apres verif JWT). Le retour est un object URL (blob:)
 * a ouvrir dans un nouvel onglet ou injecter dans un <img>/<iframe>.
 *
 * <p>Cet object URL ne vit que dans la session du navigateur ; le partager
 * ne donne rien a quelqu'un d'autre. Penser a appeler {@link URL#revokeObjectURL}
 * quand on n'en a plus besoin pour eviter de fuir le blob en memoire.
 */
export async function recupererContenu(cle: string): Promise<{ url: string; contentType: string }> {
  const token = getToken()
  const query = new URLSearchParams({ cle })
  const response = await fetch(`${API_URL}/fichiers/contenu?${query.toString()}`, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!response.ok) {
    throw new ApiError(response.status, `Echec lecture contenu pour ${cle}`)
  }
  const blob = await response.blob()
  return {
    url: URL.createObjectURL(blob),
    contentType: blob.type || 'application/octet-stream',
  }
}
