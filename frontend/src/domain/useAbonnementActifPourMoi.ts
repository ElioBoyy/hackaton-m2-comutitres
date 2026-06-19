import { useEffect, useState } from 'react'
import { isAuthenticated } from '~/lib/auth'
import { fetchDashboard, FiltreDossiers } from '~/lib/dashboard'

// Cache module-level d'une seule promesse partagee entre les ecrans du
// tunnel de souscription. Evite de relancer /api/dashboard a chaque pas
// (recommandation/pour-qui, souscription/detail, etc.) alors que la
// reponse ne change pas pendant le wizard.
let cache: Promise<boolean> | null = null

function chargerAbonnementActifPourMoi(): Promise<boolean> {
  if (cache) return cache
  cache = fetchDashboard(FiltreDossiers.ACTIVE)
    .then((r) =>
      // "Pour moi" = dossier sans beneficiaire nomme (porteur = user
      // connecte, beneficiaireNomComplet null). Cf. regle backend dans
      // CreerDossierHandler.validerPasDeDoublon.
      r.dossiers.some((d) => d.beneficiaireNomComplet == null),
    )
    .catch(() => {
      cache = null // permet un re-essai sur la prochaine page
      return false // en cas d'echec API, on n'active pas le blocage cote UI
    })
  return cache
}

/** Force un re-fetch a la prochaine lecture (apres creation d'un dossier). */
export function invaliderAbonnementActifPourMoiCache(): void {
  cache = null
}

/**
 * Indique si l'utilisateur connecte a deja un abonnement ACTIF/VALIDE pour
 * lui-meme (cf. {@code AbonnementActifExistantException} cote backend).
 * Permet d'inactiver le choix "Pour moi" en amont du wizard et d'eviter le
 * 422 a la fin.
 *
 * <p>Renvoie {@code null} tant que la requete n'a pas resolu (premiere
 * lecture). Renvoie {@code false} pour un utilisateur non connecte (pas de
 * dashboard, pas de doublon possible).
 */
export function useAbonnementActifPourMoi(): boolean | null {
  const [actif, setActif] = useState<boolean | null>(null)
  useEffect(() => {
    if (!isAuthenticated()) {
      setActif(false)
      return
    }
    let cancelled = false
    chargerAbonnementActifPourMoi().then((v) => {
      if (!cancelled) setActif(v)
    })
    return () => { cancelled = true }
  }, [])
  return actif
}
