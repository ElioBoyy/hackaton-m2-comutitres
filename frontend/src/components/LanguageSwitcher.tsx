import { useEffect, useRef, useState } from 'react'
import { getLocale, locales, setLocale, type Locale } from '~/paraglide/runtime'
import { m } from '~/paraglide/messages'

const LOCALE_META: Record<Locale, { flag: string; name: string }> = {
  fr: { flag: '🇫🇷', name: 'Français' },
  en: { flag: '🇬🇧', name: 'English' },
  pt: { flag: '🇵🇹', name: 'Português' },
  es: { flag: '🇪🇸', name: 'Español' },
  zh: { flag: '🇨🇳', name: '中文' },
}

export function LanguageSwitcher() {
  const current = getLocale()
  const currentMeta = LOCALE_META[current]
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function switchTo(locale: Locale) {
    setOpen(false)
    if (locale === current) return
    setLocale(locale)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={m.language_switch_label()}
        className="inline-flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm border border-gray-200 text-sm font-medium text-dark hover:bg-white transition cursor-pointer"
      >
        <span aria-hidden className="text-base leading-none">
          {currentMeta.flag}
        </span>
        <span>{currentMeta.name}</span>
        <svg
          aria-hidden
          width="12"
          height="12"
          viewBox="0 0 12 12"
          className={`transition ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label={m.language_switch_label()}
          className="absolute bottom-full left-0 z-10 mb-1 min-w-[10rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg lg:bottom-auto lg:left-auto lg:right-0 lg:top-full lg:mb-0 lg:mt-1"
        >
          {locales.map((locale) => {
            const meta = LOCALE_META[locale]
            const active = locale === current
            return (
              <li key={locale}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => switchTo(locale)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition cursor-pointer ${
                    active
                      ? 'bg-focus/10 font-semibold text-dark'
                      : 'text-dark hover:bg-gray-100'
                  }`}
                >
                  <span aria-hidden className="text-base leading-none">
                    {meta.flag}
                  </span>
                  <span>{meta.name}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
