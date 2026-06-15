import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main>
      <h1>jegeremacartenavigo</h1>
      <p>
        Front TanStack Start cable au backend Spring. Le client HTTP est dans{' '}
        <code>src/lib/api.ts</code> (base URL : <code>VITE_API_URL</code>).
      </p>
    </main>
  )
}
