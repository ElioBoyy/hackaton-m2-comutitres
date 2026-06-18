export function NavigoIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Card body */}
      <rect x="20" y="15" width="120" height="80" rx="10" fill="white" fillOpacity="0.18" />
      <rect x="20" y="15" width="120" height="80" rx="10" fill="none" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />

      {/* Chip */}
      <rect x="34" y="30" width="20" height="15" rx="3" fill="white" fillOpacity="0.55" />
      <line x1="34" y1="37.5" x2="54" y2="37.5" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="44" y1="30" x2="44" y2="45" stroke="white" strokeOpacity="0.3" strokeWidth="1" />

      {/* Navigo wordmark */}
      <text x="80" y="42" textAnchor="middle" fill="white" fillOpacity="0.9" fontFamily="system-ui, sans-serif" fontSize="9" fontWeight="700" letterSpacing="2">NAVIGO</text>

      {/* M metro symbol */}
      <circle cx="80" cy="68" r="16" fill="white" fillOpacity="0.15" />
      <text x="80" y="74" textAnchor="middle" fill="white" fillOpacity="0.95" fontFamily="system-ui, sans-serif" fontSize="18" fontWeight="800">M</text>

      {/* Signal waves (NFC) */}
      <path d="M110 60 Q115 55 110 50" stroke="white" strokeOpacity="0.5" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M113 63 Q122 55 113 47" stroke="white" strokeOpacity="0.35" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}
