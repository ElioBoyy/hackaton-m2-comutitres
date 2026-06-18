import { createFileRoute, Link } from '@tanstack/react-router'
import { AuthLayout } from '~/components/AuthLayout'
import { Button } from '~/components/Button'
import { m } from '~/paraglide/messages'

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <AuthLayout title={m.home_title()} subtitle={m.home_subtitle()}>
      <div className="flex flex-col gap-3">
        <Link to="/register">
          <Button type="button">{m.auth_create_account()}</Button>
        </Link>
        <Link to="/login">
          <Button type="button" variant="ghost">
            {m.home_have_account_cta()}
          </Button>
        </Link>
        <Link
          to="/points-de-vente"
          className="mt-1 text-center text-sm font-medium text-primary hover:underline"
        >
          Trouver un point de vente près de chez moi
        </Link>
      </div>
    </AuthLayout>
  );
}
