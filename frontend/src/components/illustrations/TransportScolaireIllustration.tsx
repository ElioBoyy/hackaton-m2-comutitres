export function TransportScolaireIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Bus body */}
      <rect x="18" y="42" width="124" height="52" rx="8" fill="white" fillOpacity="0.25" />
      {/* Front cab bump */}
      <rect x="18" y="50" width="20" height="44" rx="4" fill="white" fillOpacity="0.1" />

      {/* Roof sign "SCOLAIRE" strip */}
      <rect x="30" y="34" width="100" height="14" rx="4" fill="white" fillOpacity="0.35" />
      <text x="80" y="45" textAnchor="middle" fill="white" fillOpacity="0.9" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="700" letterSpacing="1.5">SCOLAIRE</text>

      {/* Windows */}
      <rect x="44" y="50" width="20" height="16" rx="3" fill="white" fillOpacity="0.45" />
      <rect x="70" y="50" width="20" height="16" rx="3" fill="white" fillOpacity="0.45" />
      <rect x="96" y="50" width="20" height="16" rx="3" fill="white" fillOpacity="0.45" />
      {/* Front windshield */}
      <rect x="22" y="50" width="14" height="16" rx="2" fill="white" fillOpacity="0.35" />

      {/* Door */}
      <rect x="120" y="56" width="16" height="30" rx="3" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="128" y1="56" x2="128" y2="86" stroke="white" strokeOpacity="0.3" strokeWidth="1" />

      {/* Wheels */}
      <circle cx="42" cy="94" r="10" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx="42" cy="94" r="4" fill="white" fillOpacity="0.4" />
      <circle cx="110" cy="94" r="10" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx="110" cy="94" r="4" fill="white" fillOpacity="0.4" />

      {/* Headlight */}
      <rect x="19" y="72" width="8" height="6" rx="2" fill="white" fillOpacity="0.7" />

      {/* Stars above */}
      <circle cx="128" cy="22" r="2" fill="white" fillOpacity="0.6" />
      <circle cx="140" cy="30" r="1.5" fill="white" fillOpacity="0.45" />
      <circle cx="118" cy="28" r="1" fill="white" fillOpacity="0.5" />
    </svg>
  )
}
