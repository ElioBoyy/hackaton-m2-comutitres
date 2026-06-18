export function ScolaireAccordionIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Open book */}
      <path d="M60 75 L20 66 L20 28 Q42 22 60 36 Q78 22 100 28 L100 66 Z" fill="white" fillOpacity="0.2" />
      <line x1="60" y1="36" x2="60" y2="75" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M20 28 Q42 22 60 36 L60 75 L20 66 Z" fill="white" fillOpacity="0.22" />
      <path d="M100 28 Q78 22 60 36 L60 75 L100 66 Z" fill="white" fillOpacity="0.15" />
      {/* Lines left page */}
      <line x1="30" y1="44" x2="52" y2="41" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="51" x2="52" y2="48" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="30" y1="58" x2="48" y2="55" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      {/* Lines right page */}
      <line x1="68" y1="41" x2="90" y2="44" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="68" y1="48" x2="90" y2="51" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />

      {/* Graduation cap */}
      <polygon points="145,22 172,33 145,44 118,33" fill="white" fillOpacity="0.8" />
      <rect x="142" y="33" width="6" height="12" fill="white" fillOpacity="0.8" />
      <ellipse cx="145" cy="45" rx="10" ry="4.5" fill="white" fillOpacity="0.7" />
      {/* Tassel */}
      <line x1="172" y1="33" x2="172" y2="43" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="172" cy="45" r="2" fill="white" fillOpacity="0.7" />

      {/* Stars */}
      <circle cx="195" cy="20" r="2.5" fill="white" fillOpacity="0.6" />
      <circle cx="207" cy="35" r="1.5" fill="white" fillOpacity="0.45" />
      <circle cx="185" cy="58" r="1.5" fill="white" fillOpacity="0.5" />

      {/* Imagine R card */}
      <rect x="155" y="55" width="55" height="36" rx="6" fill="white" fillOpacity="0.18" stroke="white" strokeOpacity="0.3" strokeWidth="1.2" />
      <text x="182" y="70" textAnchor="middle" fill="white" fillOpacity="0.8" fontFamily="system-ui" fontSize="6" fontWeight="700" letterSpacing="0.5">imagine R</text>
      <line x1="162" y1="76" x2="203" y2="76" stroke="white" strokeOpacity="0.25" strokeWidth="1" />
      <text x="182" y="85" textAnchor="middle" fill="white" fillOpacity="0.6" fontFamily="system-ui" fontSize="5">Île-de-France Mobilités</text>
    </svg>
  )
}
