import { useEffect, useState } from 'react'

interface Props {
  onNomClientChange: (value: string) => void
  onNumeroDossierChange: (value: string) => void
}

export function ClientSearchBar({ onNomClientChange, onNumeroDossierChange }: Props) {
  const [nomClient, setNomClient] = useState('')
  const [numeroDossier, setNumeroDossier] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => onNomClientChange(nomClient), 350)
    return () => clearTimeout(timer)
  }, [nomClient, onNomClientChange])

  useEffect(() => {
    const timer = setTimeout(() => onNumeroDossierChange(numeroDossier), 350)
    return () => clearTimeout(timer)
  }, [numeroDossier, onNumeroDossierChange])

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="font-heading text-sm font-semibold text-gray-900">
        Recherchez par nom de client ou par numero de dossier.
      </h2>

      <div className="mt-3 flex gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-700">Numero de dossier</label>
          <input
            value={numeroDossier}
            onChange={(e) => setNumeroDossier(e.target.value)}
            placeholder="ex. DOS-2026-000001"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs text-gray-700">Nom du client</label>
          <input
            value={nomClient}
            onChange={(e) => setNomClient(e.target.value)}
            placeholder="ex. Dupont"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  )
}
