import { Bell } from 'lucide-react'

export function BackofficeHeader({ agentName }: { agentName: string }) {
  const initiale = agentName.charAt(0).toUpperCase()

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b border-gray-200 bg-white px-6">
      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition hover:bg-blue-pale"
      >
        <Bell size={18} />
        <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-danger" />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-white">
          {initiale}
        </div>
        <span className="text-sm font-medium text-gray-900">{agentName}</span>
      </div>
    </header>
  )
}
