import { createFileRoute } from '@tanstack/react-router'
import { BackofficeLayout } from '~/components/backoffice/BackofficeLayout'

export const Route = createFileRoute('/backoffice/dossiers/$id')({
  component: DossierDetail,
})

function DossierDetail() {
  const { id } = Route.useParams()

  return (
    <BackofficeLayout agentName="Claire">
      <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-8 text-center">
        <p className="text-sm text-gray-700">Dossier #{id}</p>
        <h1 className="mt-2 font-heading text-lg font-semibold text-gray-900">
          Detail du dossier — a venir
        </h1>
      </div>
    </BackofficeLayout>
  )
}
