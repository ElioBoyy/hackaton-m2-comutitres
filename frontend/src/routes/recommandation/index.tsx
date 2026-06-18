import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/recommandation/')({
  beforeLoad: () => {
    throw redirect({ to: '/recommandation/pour-qui' })
  },
})
