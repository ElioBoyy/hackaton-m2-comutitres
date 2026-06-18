export function NavigoAccordionIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 100" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Metro wagon */}
      <rect x="10" y="30" width="110" height="52" rx="10" fill="white" fillOpacity="0.25" />
      {/* Windows row */}
      <rect x="20" y="42" width="20" height="14" rx="3" fill="white" fillOpacity="0.5" />
      <rect x="46" y="42" width="20" height="14" rx="3" fill="white" fillOpacity="0.5" />
      <rect x="72" y="42" width="20" height="14" rx="3" fill="white" fillOpacity="0.5" />
      <rect x="98" y="42" width="16" height="14" rx="3" fill="white" fillOpacity="0.5" />
      {/* Door */}
      <rect x="55" y="58" width="20" height="24" rx="2" fill="white" fillOpacity="0.3" />
      <line x1="65" y1="58" x2="65" y2="82" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
      {/* Wheels */}
      <circle cx="30" cy="86" r="7" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="30" cy="86" r="3" fill="white" fillOpacity="0.35" />
      <circle cx="90" cy="86" r="7" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="90" cy="86" r="3" fill="white" fillOpacity="0.35" />
      {/* Rail */}
      <line x1="0" y1="93" x2="220" y2="93" stroke="white" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="8 4" />

      {/* Navigo card floating */}
      <rect x="130" y="18" width="72" height="48" rx="7" fill="white" fillOpacity="0.2" stroke="white" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="138" y="27" width="12" height="9" rx="2" fill="white" fillOpacity="0.5" />
      <text x="166" y="38" textAnchor="middle" fill="white" fillOpacity="0.85" fontFamily="system-ui" fontSize="7" fontWeight="700" letterSpacing="1">NAVIGO</text>
      <circle cx="166" cy="52" r="7" fill="white" fillOpacity="0.12" />
      <text x="166" y="56" textAnchor="middle" fill="white" fillOpacity="0.9" fontFamily="system-ui" fontSize="9" fontWeight="800">M</text>
      {/* NFC waves */}
      <path d="M190 44 Q194 40 190 36" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M193 47 Q200 40 193 33" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
}
