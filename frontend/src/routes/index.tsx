import { createFileRoute, Link } from '@tanstack/react-router'
import { AuthLayout } from '~/components/AuthLayout'
import { Button } from '~/components/Button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <AuthLayout
      title="Comutitres Copilot"
      subtitle="Trouvez l'abonnement de transport qui vous correspond, simplement."
    >
      <div className="flex flex-col gap-3">
        <Link to="/register">
          <Button type="button">Creer mon compte</Button>
        </Link>
        <Link to="/login">
          <Button type="button" variant="ghost">
            J'ai deja un compte
          </Button>
        </Link>
      </div>
    </AuthLayout>
  )
}
