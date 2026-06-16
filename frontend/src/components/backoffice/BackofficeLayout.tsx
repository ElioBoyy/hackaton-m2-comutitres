import type { ReactNode } from 'react'
import { BackofficeHeader } from '~/components/backoffice/BackofficeHeader'
import { Sidebar } from '~/components/backoffice/Sidebar'

export function BackofficeLayout({
  agentName,
  children,
}: {
  agentName: string
  children: ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <BackofficeHeader agentName={agentName} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
