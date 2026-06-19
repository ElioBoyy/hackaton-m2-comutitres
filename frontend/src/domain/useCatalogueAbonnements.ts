import { useEffect, useState } from 'react'
import { getAbonnements } from '~/lib/api'
import { CATALOGUE_ABONNEMENTS, typeAbonnementVersAbonnement, type Abonnement } from '~/domain/abonnement'

// Cache module-level d'une seule promesse partagee entre toutes les pages
// du wizard de recommandation. Sans ce cache chaque page (resultat,
// detail, recapitulatif, paiement) referait un GET /referentiel/abonnements
// au mount. Une promesse en vol est partagee ; au succes le tableau est
// fige.
let cache: Promise<Abonnement[]> | null = null

function chargerCatalogueReel(): Promise<Abonnement[]> {
  if (cache) return cache
  cache = getAbonnements()
    .then((types) => {
      const reels = types
        .map(typeAbonnementVersAbonnement)
        .filter((a): a is Abonnement => a !== null)
      // Filet de securite : si le backend ne renvoie rien d'utilisable, on
      // retombe sur le catalogue statique pour ne pas casser le wizard.
      return reels.length > 0 ? reels : CATALOGUE_ABONNEMENTS
    })
    .catch(() => {
      cache = null // permet un re-essai sur la prochaine page
      return CATALOGUE_ABONNEMENTS
    })
  return cache
}

/**
 * Charge le referentiel reel des abonnements depuis le backend et le
 * convertit dans la forme attendue par le moteur de recommandation.
 *
 * <p>Tant que la requete n'a pas fini : retourne {@code null}. Le caller
 * peut afficher un skeleton ou repousser le calcul. En cas d'echec API :
 * retombe sur {@link CATALOGUE_ABONNEMENTS} (catalogue statique de secours)
 * pour ne pas bloquer le tunnel de souscription.
 */
export function useCatalogueAbonnements(): Abonnement[] | null {
  const [catalogue, setCatalogue] = useState<Abonnement[] | null>(null)
  useEffect(() => {
    let cancelled = false
    chargerCatalogueReel().then((cat) => {
      if (!cancelled) setCatalogue(cat)
    })
    return () => { cancelled = true }
  }, [])
  return catalogue
}
