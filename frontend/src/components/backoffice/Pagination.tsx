import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPages(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1)
  if (page <= 2) return [1, 2, '...', totalPages - 1, totalPages]
  if (page >= totalPages - 1) return [1, 2, '...', totalPages - 1, totalPages]
  return [1, '...', page, '...', totalPages]
}

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
  const pages = getPages(page, totalPages)

  const btnBase =
    'flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition'

  return (
    <div className="flex items-center justify-center gap-1.5 px-4 py-3">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Page precedente"
        className={`${btnBase} bg-gray-300 text-gray-500 disabled:opacity-50 hover:bg-gray-300`}
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className={`${btnBase} border border-gray-300 text-gray-700`}
          >
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`${btnBase} border ${
              p === page
                ? 'border-primary text-primary'
                : 'border-gray-300 text-dark hover:bg-gray-200'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Page suivante"
        className={`${btnBase} border border-gray-300 text-gray-400 disabled:opacity-50 hover:bg-gray-200`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
