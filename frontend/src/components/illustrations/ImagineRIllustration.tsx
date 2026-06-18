export function ImagineRIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Open book */}
      <path d="M80 90 L30 80 L30 35 Q55 30 80 45 Q105 30 130 35 L130 80 Z" fill="white" fillOpacity="0.2" />
      <path d="M80 45 L80 90" stroke="white" strokeOpacity="0.6" strokeWidth="2" />
      {/* Left page */}
      <path d="M30 35 Q55 30 80 45 L80 90 L30 80 Z" fill="white" fillOpacity="0.22" />
      {/* Right page */}
      <path d="M130 35 Q105 30 80 45 L80 90 L130 80 Z" fill="white" fillOpacity="0.15" />

      {/* Lines on left page */}
      <line x1="42" y1="54" x2="70" y2="51" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="61" x2="70" y2="58" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="42" y1="68" x2="65" y2="65" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />

      {/* Lines on right page */}
      <line x1="90" y1="51" x2="118" y2="54" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="90" y1="58" x2="118" y2="61" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />

      {/* Graduation cap */}
      <polygon points="80,18 105,28 80,38 55,28" fill="white" fillOpacity="0.85" />
      <rect x="77" y="28" width="6" height="12" fill="white" fillOpacity="0.85" />
      <ellipse cx="80" cy="40" rx="10" ry="5" fill="white" fillOpacity="0.75" />
      {/* Tassel */}
      <line x1="105" y1="28" x2="105" y2="36" stroke="white" strokeOpacity="0.7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="105" cy="37" r="2" fill="white" fillOpacity="0.7" />
    </svg>
  )
}
