import { createFileRoute, Link } from '@tanstack/react-router'
import { RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/not-found')({
  component: NotFoundPage,
})

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-8">
      <div className="flex w-full max-w-4xl items-center gap-16">
        {/* Texte */}
        <div className="flex-1">
          <h1 className="font-heading text-5xl font-bold leading-tight text-dark">
            Erreur 404
            <br />
            (404)
          </h1>
          <p className="mt-6 text-sm text-gray-700">
            La page que vous demandez n&rsquo;existe pas.
          </p>
          <Link
            to="/"
            className="mt-8 inline-flex items-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-blue-pale"
          >
            <RefreshCw size={14} />
            Accueil
          </Link>
        </div>

        {/* Illustration metro ligne 1 */}
        <div className="flex-1">
          <MetroIllustration />
        </div>
      </div>
    </div>
  )
}

function MetroIllustration() {
  return (
    <svg viewBox="0 0 380 380" width="380" height="380" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="cardClip">
          <rect x="110" y="40" width="160" height="250" rx="12" />
        </clipPath>
        {/* Ombre douce */}
        <filter id="shadow" x="-20%" y="-10%" width="150%" height="130%">
          <feDropShadow dx="6" dy="10" stdDeviation="12" floodColor="#1972d2" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Fond cercles concentriques */}
      <circle cx="190" cy="190" r="178" fill="#f5f9ff" />
      <circle cx="190" cy="190" r="148" fill="none" stroke="#deeeff" strokeWidth="1.5" />
      <circle cx="190" cy="190" r="118" fill="none" stroke="#deeeff" strokeWidth="1.5" />
      <circle cx="190" cy="190" r="88"  fill="none" stroke="#deeeff" strokeWidth="1.5" />

      {/* Points décoratifs */}
      <circle cx="58"  cy="80"  r="3.5" fill="#64b5f6" opacity="0.6" />
      <circle cx="312" cy="62"  r="2.5" fill="#9185be" opacity="0.5" />
      <circle cx="338" cy="155" r="3"   fill="#64b5f6" opacity="0.45" />
      <circle cx="42"  cy="230" r="2"   fill="#9185be" opacity="0.4" />
      <circle cx="68"  cy="318" r="3"   fill="#64b5f6" opacity="0.35" />
      <circle cx="325" cy="305" r="2.5" fill="#9185be" opacity="0.5" />
      <circle cx="160" cy="35"  r="2"   fill="#9185be" opacity="0.45" />
      <circle cx="265" cy="345" r="3"   fill="#64b5f6" opacity="0.35" />

      {/* Carte Navigo (portrait) avec ombre */}
      <g filter="url(#shadow)" transform="rotate(6, 190, 165)">

        {/* Corps principal bleu clair */}
        <rect x="110" y="40" width="160" height="250" rx="12" fill="#64b5f6" />

        {/* Bande sombre gauche */}
        <g clipPath="url(#cardClip)">
          <rect x="110" y="40" width="46" height="250" fill="#25303b" />
        </g>
      </g>
    </svg>
  )
}
