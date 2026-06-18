export function AmethysteIllustration({ className = 'h-24 w-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Amethyst gem — faceted crystal */}
      {/* Top facets */}
      <polygon points="80,20 105,40 80,50 55,40" fill="white" fillOpacity="0.55" />
      {/* Left upper */}
      <polygon points="55,40 80,50 60,75" fill="white" fillOpacity="0.3" />
      {/* Right upper */}
      <polygon points="105,40 80,50 100,75" fill="white" fillOpacity="0.45" />
      {/* Left lower */}
      <polygon points="60,75 80,50 80,98" fill="white" fillOpacity="0.2" />
      {/* Right lower */}
      <polygon points="100,75 80,50 80,98" fill="white" fillOpacity="0.35" />
      {/* Center divider */}
      <polygon points="60,75 100,75 80,98" fill="white" fillOpacity="0.25" />

      {/* Outline */}
      <polygon
        points="80,20 105,40 100,75 80,98 60,75 55,40"
        fill="none"
        stroke="white"
        strokeOpacity="0.5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Inner shine line */}
      <line x1="80" y1="20" x2="80" y2="50" stroke="white" strokeOpacity="0.4" strokeWidth="1" />
      <line x1="55" y1="40" x2="100" y2="75" stroke="white" strokeOpacity="0.2" strokeWidth="1" />
      <line x1="105" y1="40" x2="60" y2="75" stroke="white" strokeOpacity="0.2" strokeWidth="1" />

      {/* Sparkle top-right */}
      <g transform="translate(118, 26)" opacity="0.7">
        <line x1="0" y1="-6" x2="0" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" strokeWidth="1" strokeLinecap="round" />
        <line x1="4" y1="-4" x2="-4" y2="4" stroke="white" strokeWidth="1" strokeLinecap="round" />
      </g>
    </svg>
  )
}
