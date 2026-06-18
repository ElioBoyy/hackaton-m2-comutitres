export function NavigoIllustration({ className }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className ?? ''}`}>
      <img
        src="/navigo-card-transparent.png"
        alt="Carte Navigo"
        className="h-48 w-auto -rotate-12 scale-125 drop-shadow-lg"
      />
    </div>
  )
}
