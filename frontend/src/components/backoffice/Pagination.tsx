import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-sm text-gray-700">
        Page {page} sur {totalPages} ({total} dossiers)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-blue-pale disabled:opacity-40"
          aria-label="Page precedente"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-blue-pale disabled:opacity-40"
          aria-label="Page suivante"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
