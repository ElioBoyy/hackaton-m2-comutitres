export function SolidaireAccordionIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Three person silhouettes */}
      {/* Person left */}
      <circle cx="70" cy="28" r="11" fill="white" fillOpacity="0.3" />
      <path d="M52 72 Q52 52 70 52 Q88 52 88 72" fill="white" fillOpacity="0.2" />

      {/* Person center (taller) */}
      <circle cx="110" cy="24" r="13" fill="white" fillOpacity="0.4" />
      <path d="M90 72 Q90 48 110 48 Q130 48 130 72" fill="white" fillOpacity="0.3" />

      {/* Person right */}
      <circle cx="150" cy="28" r="11" fill="white" fillOpacity="0.3" />
      <path d="M132 72 Q132 52 150 52 Q168 52 168 72" fill="white" fillOpacity="0.2" />

      {/* Connecting hands / line */}
      <path d="M80 62 Q95 58 110 62 Q125 58 140 62" stroke="white" strokeOpacity="0.45" strokeWidth="2" fill="none" strokeLinecap="round" />

      {/* Heart above center */}
      <path d="M110 14 C110 14 103 7 103 4 C103 1 107 -1 110 2 C113 -1 117 1 117 4 C117 7 110 14 110 14Z" fill="white" fillOpacity="0.75" />

      {/* Ground line */}
      <line x1="40" y1="78" x2="180" y2="78" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" />

      {/* Bus stop sign right */}
      <rect x="185" y="20" width="24" height="16" rx="4" fill="white" fillOpacity="0.25" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
      <text x="197" y="31" textAnchor="middle" fill="white" fillOpacity="0.85" fontFamily="system-ui" fontSize="7" fontWeight="800">BUS</text>
      <line x1="197" y1="36" x2="197" y2="78" stroke="white" strokeOpacity="0.3" strokeWidth="2" />

      {/* Ticket / pass icon left */}
      <rect x="18" y="38" width="30" height="20" rx="4" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.35" strokeWidth="1" />
      <line x1="18" y1="48" x2="48" y2="48" stroke="white" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 2" />
      <text x="33" y="44" textAnchor="middle" fill="white" fillOpacity="0.7" fontFamily="system-ui" fontSize="5" fontWeight="600">GRATUIT</text>
      <text x="33" y="55" textAnchor="middle" fill="white" fillOpacity="0.55" fontFamily="system-ui" fontSize="4">Solidarité</text>
    </svg>
  )
}
