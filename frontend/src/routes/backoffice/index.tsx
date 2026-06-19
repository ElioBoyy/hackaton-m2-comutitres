import { createFileRoute, redirect } from '@tanstack/react-router'

/**
 * Redirige /backoffice vers /backoffice/login. Toute autre page backoffice
 * verifie l'authentification de son cote (cf. /backoffice/dashboard).
 */
export const Route = createFileRoute('/backoffice/')({
  beforeLoad: () => {
    throw redirect({ to: '/backoffice/login' })
  },
})
