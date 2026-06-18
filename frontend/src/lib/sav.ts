import type { StatutCategorie } from '~/lib/types/dossier'
import { m } from '~/paraglide/messages'

export type CategorieReclamation = 'PAIEMENT' | 'ABONNEMENT' | 'CARTE' | 'REMBOURSEMENT' | 'AUTRE'
export type StatutReclamation = 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME'

export interface MessageReclamation {
  id: string
  auteur: 'CLIENT' | 'AGENT'
  contenu: string
  date: string
}

export interface Reclamation {
  id: string
  reference: string
  categorie: CategorieReclamation
  objet: string
  dateCreation: string
  dateMiseAJour: string
  statut: StatutReclamation
  messages: MessageReclamation[]
}

export function categoriePourStatut(statut: StatutReclamation): StatutCategorie {
  if (statut === 'RESOLU') return 'abouti'
  if (statut === 'FERME') return 'clos'
  return 'en_cours'
}

export function libelleStatut(statut: StatutReclamation): string {
  switch (statut) {
    case 'OUVERT': return m.sav_status_open()
    case 'EN_COURS': return m.sav_status_processing()
    case 'RESOLU': return m.sav_status_resolved()
    case 'FERME': return m.sav_status_closed()
  }
}

export function libelleCategorie(cat: CategorieReclamation): string {
  switch (cat) {
    case 'PAIEMENT': return m.sav_cat_payment()
    case 'ABONNEMENT': return m.sav_cat_subscription()
    case 'CARTE': return m.sav_cat_card()
    case 'REMBOURSEMENT': return m.sav_cat_refund()
    case 'AUTRE': return m.sav_cat_other()
  }
}

export const CATEGORIES_SAV: CategorieReclamation[] = [
  'PAIEMENT',
  'ABONNEMENT',
  'CARTE',
  'REMBOURSEMENT',
  'AUTRE',
]

export const MOCK_RECLAMATIONS: Reclamation[] = [
  {
    id: '1',
    reference: 'REC-2026-001',
    categorie: 'PAIEMENT',
    objet: 'Prélèvement en double sur mon compte',
    dateCreation: '2026-06-10T09:00:00Z',
    dateMiseAJour: '2026-06-12T14:30:00Z',
    statut: 'EN_COURS',
    messages: [
      {
        id: 'm1',
        auteur: 'CLIENT',
        contenu: "Bonjour, j'ai constaté deux prélèvements de 84,10 € pour mon Navigo Annuel en juin. Pouvez-vous vérifier ?",
        date: '2026-06-10T09:00:00Z',
      },
      {
        id: 'm2',
        auteur: 'AGENT',
        contenu: "Bonjour, merci pour votre signalement. Nous avons ouvert une investigation. Vous serez remboursé sous 5 jours ouvrés si le doublon est confirmé.",
        date: '2026-06-12T14:30:00Z',
      },
    ],
  },
  {
    id: '2',
    reference: 'REC-2026-002',
    categorie: 'CARTE',
    objet: 'Perte de ma carte Navigo Liberté+',
    dateCreation: '2026-06-08T11:15:00Z',
    dateMiseAJour: '2026-06-08T11:15:00Z',
    statut: 'OUVERT',
    messages: [
      {
        id: 'm3',
        auteur: 'CLIENT',
        contenu: "J'ai perdu ma carte Navigo Liberté+ hier dans le métro. J'aimerais la faire bloquer et obtenir un duplicata.",
        date: '2026-06-08T11:15:00Z',
      },
    ],
  },
  {
    id: '3',
    reference: 'REC-2026-003',
    categorie: 'REMBOURSEMENT',
    objet: 'Demande de remboursement – suspension médicale',
    dateCreation: '2026-05-20T08:45:00Z',
    dateMiseAJour: '2026-06-04T09:30:00Z',
    statut: 'RESOLU',
    messages: [
      {
        id: 'm4',
        auteur: 'CLIENT',
        contenu: "Suite à une hospitalisation du 5 au 19 mai, je souhaite obtenir un remboursement partiel de mon Navigo Annuel.",
        date: '2026-05-20T08:45:00Z',
      },
      {
        id: 'm5',
        auteur: 'AGENT',
        contenu: "Votre demande de remboursement a été traitée. Un avoir de 28,70 € a été crédité sur votre compte Navigo. Délai d'application : 5 à 10 jours.",
        date: '2026-06-02T10:00:00Z',
      },
      {
        id: 'm6',
        auteur: 'CLIENT',
        contenu: "Merci beaucoup, j'ai bien reçu le remboursement.",
        date: '2026-06-04T09:30:00Z',
      },
    ],
  },
]
