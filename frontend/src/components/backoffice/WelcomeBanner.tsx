export function WelcomeBanner({ agentName }: { agentName: string }) {
  return (
    <div className="rounded-2xl bg-primary px-6 py-5 text-white">
      <h1 className="font-heading text-xl font-semibold">Bonjour {agentName}</h1>
      <p className="mt-1 text-sm text-blue-soft">
        Voici les dossiers en attente de verification.
      </p>
    </div>
  )
}
