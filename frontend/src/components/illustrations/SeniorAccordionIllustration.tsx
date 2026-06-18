export function SeniorAccordionIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Large amethyst gem */}
      <polygon points="110,15 148,38 142,72 110,88 78,72 72,38" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Facets */}
      <polygon points="110,15 148,38 110,48 72,38" fill="white" fillOpacity="0.35" />
      <polygon points="72,38 110,48 78,72" fill="white" fillOpacity="0.18" />
      <polygon points="148,38 110,48 142,72" fill="white" fillOpacity="0.28" />
      <polygon points="78,72 110,48 110,88" fill="white" fillOpacity="0.12" />
      <polygon points="142,72 110,48 110,88" fill="white" fillOpacity="0.22" />
      <polygon points="78,72 142,72 110,88" fill="white" fillOpacity="0.15" />
      {/* Inner lines */}
      <line x1="110" y1="15" x2="110" y2="48" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
      <line x1="72" y1="38" x2="142" y2="72" stroke="white" strokeOpacity="0.15" strokeWidth="1" />
      <line x1="148" y1="38" x2="78" y2="72" stroke="white" strokeOpacity="0.15" strokeWidth="1" />

      {/* Sparkle top-right */}
      <g transform="translate(175,22)" opacity="0.75">
        <line x1="0" y1="-7" x2="0" y2="7" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="-7" y1="0" x2="7" y2="0" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4" y1="-4" x2="-4" y2="4" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      {/* Small sparkle */}
      <g transform="translate(195,55)" opacity="0.5">
        <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </g>

      {/* Améthyste label */}
      <text x="110" y="52" textAnchor="middle" fill="white" fillOpacity="0.9" fontFamily="system-ui" fontSize="7" fontWeight="700" letterSpacing="1">AMÉTHYSTE</text>

      {/* Leaf decoration left */}
      <path d="M30 60 Q18 45 30 30 Q42 45 30 60Z" fill="white" fillOpacity="0.2" />
      <line x1="30" y1="30" x2="30" y2="60" stroke="white" strokeOpacity="0.3" strokeWidth="1" />
      <path d="M48 70 Q38 58 48 46 Q58 58 48 70Z" fill="white" fillOpacity="0.15" />
      <line x1="48" y1="46" x2="48" y2="70" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
    </svg>
  )
}
