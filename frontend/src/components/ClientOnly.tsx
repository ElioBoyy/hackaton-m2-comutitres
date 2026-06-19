import { useEffect, useState, type ReactNode } from 'react'

/**
 * Ne rend ses {@code children} qu'apres l'hydration cote client. Pendant le
 * rendu SSR + le premier render client (avant {@code useEffect}), retourne
 * {@code fallback}.
 *
 * <p>Utile pour les zones dont l'etat depend de {@code localStorage} (ex:
 * status d'authentification) : sans ce wrapper, le serveur rend "deconnecte"
 * et le client bascule a "connecte" apres l'hydration, ce qui produit un
 * flash visible (boutons "Se connecter / Creer un compte" qui disparaissent).
 *
 * <p>Le {@code fallback} doit idealement avoir la meme taille que le contenu
 * final pour eviter un layout shift au moment du basculement.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode
  fallback?: ReactNode
}) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return <>{mounted ? children : fallback}</>
}
