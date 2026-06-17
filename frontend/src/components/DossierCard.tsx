import { ArrowRight, AlertTriangle } from 'lucide-react'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { m } from '~/paraglide/messages'
import type { DossierDashboard } from '~/lib/dashboard'

function formatDate(iso: string): string {
  if (!iso) return '-'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatMontant(n: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n)
}

const ROLE_LABEL_KEY: Record<string, keyof typeof m> = {
  PORTEUR_ET_PAYEUR: 'nav_my_subscriptions',
}

function getRoleLabel(role: string, autreNom: string | null): string {
  if (role === 'PORTEUR_ET_PAYEUR') return 'Mon abonnement'
  if (role === 'PAYEUR') return autreNom ? `Je paie pour ${autreNom}` : 'Je paie pour'
  if (role === 'PORTEUR') return autreNom ? `Payé par ${autreNom}` : 'Payé par'
  return role
}

export function DossierCard({ dossier }: { dossier: DossierDashboard }) {
  const autreNom = dossier.autrePersonne
    ? `${dossier.autrePersonne.prenom} ${dossier.autrePersonne.nom}`
    : null
  const roleLabel = getRoleLabel(dossier.role, autreNom)

  return (
    <tr className="border-b border-gray-200 last:border-0">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{dossier.typeAbonnementLibelle}</p>
        <p className="mt-0.5 text-xs text-gray-700">{roleLabel}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge libelle={dossier.statut.libelle} categorie={dossier.statut.categorie as any} />
      </td>
      <td className="hidden px-4 py-3 text-sm text-gray-700 sm:table-cell">
        {formatDate(dossier.dateDebutDroits)} — {formatDate(dossier.dateFinDroits)}
      </td>
      <td className="hidden px-4 py-3 text-sm text-gray-700 sm:table-cell">
        {formatMontant(dossier.montantTotal)}
      </td>
      <td className="px-4 py-3">
        {dossier.piecesADeposer && (
          <span
            aria-label={m.dashboard_missing_docs_aria()}
            className="inline-flex items-center gap-1 text-xs font-medium text-warning"
          >
            <AlertTriangle size={14} aria-hidden="true" />
            <span className="hidden sm:inline">{m.dashboard_missing_docs()}</span>
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <a
          href={`/dossier/${dossier.idDossier}`}
          aria-label={m.dashboard_see_link_aria({ name: dossier.typeAbonnementLibelle })}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-primary transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <ArrowRight size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{m.dashboard_see_link()}</span>
        </a>
      </td>
    </tr>
  )
}
