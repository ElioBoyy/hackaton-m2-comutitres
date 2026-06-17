import { createFileRoute } from '@tanstack/react-router'
import { AuthLayout } from '~/components/AuthLayout'
import { Button } from '~/components/Button'

export const Route = createFileRoute('/contact')({
  component: Contact,
})

// Numero du conseiller vocal Retell (agent "Camille"). Public (non secret) :
// valeur par defaut en dur pour marcher partout, surchargeable via VITE_RETELL_PHONE.
const NUMERO = (import.meta.env.VITE_RETELL_PHONE ?? '').trim() || '+1 (478) 800-5235'

function Contact() {
  // Numero compose pour le lien tel: (on garde + et chiffres uniquement).
  const tel = NUMERO.replace(/[^+0-9]/g, '')

  return (
    <AuthLayout
      title="Contacter un conseiller"
      subtitle="Besoin d'aide ? Appelez notre conseiller vocal, disponible pour vos questions sur les titres Navigo."
    >
      {NUMERO ? (
        <div className="flex flex-col gap-5">
          <a
            href={`tel:${tel}`}
            className="block rounded-2xl bg-blue-pale py-6 text-center transition hover:bg-blue-soft"
            aria-label={`Appeler le ${NUMERO}`}
          >
            <span className="block text-sm font-medium text-gray-700">Appelez le</span>
            <span className="mt-1 block font-heading text-3xl font-bold tracking-tight text-focus">
              {NUMERO}
            </span>
          </a>

          <a href={`tel:${tel}`} aria-label={`Appeler le ${NUMERO}`}>
            <Button type="button">Appeler maintenant</Button>
          </a>

          <p className="text-center text-xs text-gray-700">
            Vous serez mis en relation avec notre assistante IA Camille, qui répond
            à vos questions et vous oriente vers un conseiller si besoin.
          </p>
        </div>
      ) : (
        <p className="text-gray-700">
          Le numéro du conseiller n'est pas encore configuré. Renseignez{' '}
          <code>VITE_RETELL_PHONE</code> dans le <code>.env</code> du frontend.
        </p>
      )}
    </AuthLayout>
  )
}
