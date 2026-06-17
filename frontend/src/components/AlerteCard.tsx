import { Bell, CreditCard, Tag } from 'lucide-react'
import { m } from '~/paraglide/messages'
import type { AlerteDashboard } from '~/lib/dashboard'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function IconAlerte({ type }: { type: string }) {
  if (type === 'REMBOURSEMENT_DISPONIBLE') return <CreditCard size={16} aria-hidden="true" />
  if (type === 'REDUCTION_DISPONIBLE') return <Tag size={16} aria-hidden="true" />
  return <Bell size={16} aria-hidden="true" />
}

export function AlerteCard({ alerte }: { alerte: AlerteDashboard }) {
  return (
    <article
      className="flex gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3"
      aria-label={`${m.dashboard_notifications()} : ${alerte.titre}`}
    >
      <div className="mt-0.5 shrink-0 text-warning">
        <IconAlerte type={alerte.type} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">{alerte.titre}</p>
        <p className="mt-0.5 text-sm text-gray-700">{alerte.contenu}</p>
        <time dateTime={alerte.dateCreation} className="mt-1 block text-xs text-gray-700">
          {formatDate(alerte.dateCreation)}
        </time>
      </div>
    </article>
  )
}
