import { CATALOGUE_ABONNEMENTS, getAbonnement, type Abonnement } from '~/domain/abonnement'
import type { FrequenceDeplacement } from '~/domain/frequenceDeplacement'
import type { Residence } from '~/domain/residence'
import type { Situation } from '~/domain/situation'

// ScoreAdaptation : pourcentage qui exprime a quel point un Abonnement
// correspond aux reponses du RecommendationWizard (cf. CONTEXT.md). Regles
// simples ecrites a la main, pas un vrai moteur de recommandation.
export interface AbonnementRecommande {
  abonnement: Abonnement
  scoreAdaptation: number
}

export interface ResultatRecommandation {
  recommandePrincipal: AbonnementRecommande
  autresOptions: AbonnementRecommande[]
  economieAnnuelleEuros: number
}

export interface ReponsesWizard {
  situation: Situation
  frequenceDeplacement: FrequenceDeplacement
  residence: Residence
}

function scoreAbonnement(abonnementId: string, reponses: ReponsesWizard): number {
  const { situation, frequenceDeplacement } = reponses
  let score = 50

  // Bonus etudiant strictement superieur a tous les autres bonus combines,
  // pour garantir qu'un etudiant voit Imagine R Etudiant en recommandation
  // principale quand il se deplace QUOTIDIEN ou REGULIER. Exception
  // volontaire : un etudiant OCCASIONNEL est mieux servi par Liberte+ (pas
  // de bonus etudiant dans ce cas, cf. regle ci-dessous).
  if (
    abonnementId === 'IMAGINE_R_ETUDIANT' &&
    situation === 'ETUDIANT' &&
    frequenceDeplacement !== 'OCCASIONNEL'
  )
    score += 45
  if (abonnementId === 'NAVIGO_ANNUEL' && frequenceDeplacement === 'QUOTIDIEN') score += 35
  if (abonnementId === 'NAVIGO_MENSUEL' && frequenceDeplacement === 'REGULIER') score += 25
  if (abonnementId === 'NAVIGO_LIBERTE_PLUS' && frequenceDeplacement === 'OCCASIONNEL') score += 40
  if (abonnementId === 'NAVIGO_ANNUEL' && situation === 'ACTIF') score += 15
  if (abonnementId === 'IMAGINE_R_ETUDIANT' && situation === 'ALTERNANCE') score += 20

  return Math.max(5, Math.min(score, 95))
}

export function calculerRecommandation(reponses: ReponsesWizard): ResultatRecommandation {
  const classement = CATALOGUE_ABONNEMENTS.map((abonnement) => ({
    abonnement,
    scoreAdaptation: scoreAbonnement(abonnement.id, reponses),
  })).sort((a, b) => b.scoreAdaptation - a.scoreAdaptation)

  const [recommandePrincipal, ...autresOptions] = classement
  const moinsAdapte = classement[classement.length - 1]
  const economieAnnuelleEuros = Math.max(
    0,
    moinsAdapte.abonnement.prixAnnuelEuros - recommandePrincipal.abonnement.prixAnnuelEuros,
  )

  return { recommandePrincipal, autresOptions, economieAnnuelleEuros }
}

export function getAbonnementById(id: string): Abonnement {
  return getAbonnement(id)
}

// Abonnement effectivement retenu par l'usager : la recommandation
// principale par defaut, ou l'option qu'il a choisie a la main sur l'ecran
// resultat (cf. wizardSlice.abonnementSelectionneId).
export function selectionnerAbonnement(
  resultat: ResultatRecommandation,
  abonnementSelectionneId: string | null,
): AbonnementRecommande {
  if (!abonnementSelectionneId) return resultat.recommandePrincipal
  const toutes = [resultat.recommandePrincipal, ...resultat.autresOptions]
  return toutes.find((item) => item.abonnement.id === abonnementSelectionneId) ?? resultat.recommandePrincipal
}
