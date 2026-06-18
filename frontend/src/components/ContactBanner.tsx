import { Phone } from 'lucide-react'

// Numero du conseiller vocal Retell (agent "Camille"). Public (non secret) :
// valeur par defaut en dur pour marcher partout, surchargeable via VITE_RETELL_PHONE.
const NUMERO = (import.meta.env.VITE_RETELL_PHONE ?? '').trim() || '+1 (478) 800-5235'
const TEL = NUMERO.replace(/[^+0-9]/g, '')

// Bandeau "contacter un conseiller" reutilise sur /aide et /sav (ancre #contact).
// Met en relation avec l'assistante vocale Camille (puis un conseiller si besoin).
export function ContactBanner() {
  return (
    <div
      id="contact"
      className="flex scroll-mt-20 flex-col gap-3 rounded-2xl border border-primary/20 bg-blue-pale p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary">
          <Phone size={18} className="text-white" aria-hidden="true" />
        </div>
        <div>
          <p className="font-heading text-sm font-semibold text-dark">Service client Navigo</p>
          <p className="text-xs text-gray-700">24h/24 · 7j/7 · Appel non surtaxé</p>
        </div>
      </div>
      <a
        href={`tel:${TEL}`}
        aria-label={`Appeler le ${NUMERO}`}
        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <Phone size={15} aria-hidden="true" />
        {NUMERO}
      </a>
    </div>
  )
}
