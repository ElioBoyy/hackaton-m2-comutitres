import { useState } from 'react'
import { Search } from 'lucide-react'
import { searchDossiers } from '~/lib/api'
import type { DossierResume } from '~/lib/types/dossier'

export function ClientSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DossierResume[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      setResults(await searchDossiers(query.trim()))
    } catch {
      setError('Recherche indisponible pour le moment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="font-heading text-sm font-semibold text-gray-900">
        Agir a la place d'un client
      </h2>
      <p className="mt-1 text-xs text-gray-700">
        Recherchez un dossier ou un client pour effectuer une demarche pour lui.
      </p>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-700"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom, email ou numero de dossier"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-focus disabled:opacity-60"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {results && results.length === 0 && !error && (
        <p className="mt-3 text-sm text-gray-700">Aucun resultat.</p>
      )}

      {results && results.length > 0 && (
        <ul className="mt-3 divide-y divide-gray-200">
          {results.map((dossier) => (
            <li key={dossier.idDossier} className="py-2 text-sm text-gray-900">
              {dossier.nomTitulaire} — {dossier.typeAbonnement.libelle}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
