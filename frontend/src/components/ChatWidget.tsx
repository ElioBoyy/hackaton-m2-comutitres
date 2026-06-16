import * as React from 'react'
import { streamChat, type ChatCitation, type ChatFin } from '~/lib/api'

interface Message {
  role: 'utilisateur' | 'assistant'
  texte: string
  citations?: Array<ChatCitation>
  escalade?: boolean
  referenceTicket?: string | null
}

/**
 * Widget de chat en overlay (coin bas-droit), present sur toutes les pages via
 * le layout racine. Conversation multi-tours en streaming (SSE), bouton
 * d'envoi, "nouvelle conversation", fermeture. Accessible sans compte.
 */
export function ChatWidget() {
  const [ouvert, setOuvert] = React.useState(false)
  const [messages, setMessages] = React.useState<Array<Message>>([])
  const [saisie, setSaisie] = React.useState('')
  const [enCours, setEnCours] = React.useState(false)
  const sessionId = React.useRef<number | null>(null)
  const finZone = React.useRef<HTMLDivElement>(null)

  // Auto-scroll vers le dernier message a chaque mise a jour.
  React.useEffect(() => {
    finZone.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, ouvert])

  function nouvelleConversation() {
    if (enCours) return
    sessionId.current = null
    setMessages([])
    setSaisie('')
  }

  async function envoyer(e: React.FormEvent) {
    e.preventDefault()
    const message = saisie.trim()
    if (!message || enCours) return
    setSaisie('')
    setEnCours(true)
    setMessages((prev) => [
      ...prev,
      { role: 'utilisateur', texte: message },
      { role: 'assistant', texte: '' },
    ])

    const majAssistant = (patch: (m: Message) => Message) =>
      setMessages((prev) => {
        const copie = [...prev]
        copie[copie.length - 1] = patch(copie[copie.length - 1])
        return copie
      })

    try {
      await streamChat(
        { sessionId: sessionId.current, message, canal: 'web' },
        {
          onToken: (t) => majAssistant((m) => ({ ...m, texte: m.texte + t })),
          onDone: (fin: ChatFin) => {
            sessionId.current = fin.sessionId
            majAssistant((m) => ({
              ...m,
              texte: fin.texte || m.texte,
              citations: fin.citations,
              escalade: fin.escalade,
              referenceTicket: fin.referenceTicket,
            }))
          },
          onError: (msg) =>
            majAssistant((m) => ({ ...m, texte: m.texte || `Erreur : ${msg}` })),
        },
      )
    } catch (err) {
      majAssistant((m) => ({
        ...m,
        texte: m.texte || `Connexion impossible : ${(err as Error).message}`,
      }))
    } finally {
      setEnCours(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      {ouvert && (
        <section
          className="chat-panel-in flex h-[30rem] max-h-[calc(100vh-6rem)] w-[22rem] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-2xl"
          role="dialog"
          aria-label="Assistant Navigo"
        >
          {/* En-tete */}
          <header className="flex items-center justify-between gap-2 bg-focus px-4 py-3 text-white">
            <div>
              <p className="font-heading text-base font-semibold leading-tight">Assistant Navigo</p>
              <p className="text-xs text-white/80">Souscription, tarifs, justificatifs…</p>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={nouvelleConversation}
                disabled={enCours}
                title="Nouvelle conversation"
                aria-label="Nouvelle conversation"
                className="rounded-lg p-1.5 transition hover:bg-white/15 disabled:opacity-50"
              >
                <IconePlus />
              </button>
              <button
                type="button"
                onClick={() => setOuvert(false)}
                title="Fermer"
                aria-label="Fermer le chat"
                className="rounded-lg p-1.5 transition hover:bg-white/15"
              >
                <IconeFermer />
              </button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 space-y-2 overflow-y-auto bg-gray-100 px-3 py-3">
            {messages.length === 0 && (
              <p className="mt-6 px-2 text-center text-sm text-gray-700">
                Bonjour&nbsp;! Posez votre question sur les titres Navigo. Les réponses
                sont fondées sur la documentation officielle et citées.
              </p>
            )}
            {messages.map((m, i) => (
              <Bulle key={i} message={m} enCours={enCours && i === messages.length - 1} />
            ))}
            <div ref={finZone} />
          </div>

          {/* Saisie */}
          <form onSubmit={envoyer} className="flex items-center gap-2 border-t border-gray-200 bg-white p-2">
            <input
              value={saisie}
              onChange={(e) => setSaisie(e.target.value)}
              placeholder="Écrivez un message…"
              aria-label="Votre message"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
            />
            <button
              type="submit"
              disabled={enCours || !saisie.trim()}
              aria-label="Envoyer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-focus text-white transition hover:bg-focus/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IconeEnvoyer />
            </button>
          </form>
        </section>
      )}

      {/* Bouton flottant */}
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        aria-expanded={ouvert}
        aria-label={ouvert ? 'Réduire le chat' : 'Ouvrir le chat'}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-focus text-white shadow-xl transition hover:bg-focus/90 hover:scale-105 active:scale-95"
      >
        {ouvert ? <IconeFermer /> : <IconeChat />}
      </button>
    </div>
  )
}

function Bulle({ message, enCours }: { message: Message; enCours: boolean }) {
  const estUtilisateur = message.role === 'utilisateur'
  const enAttente = !estUtilisateur && enCours && message.texte === ''

  return (
    <div className={`flex ${estUtilisateur ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`chat-bubble-in max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm shadow-sm ${
          estUtilisateur
            ? 'rounded-br-sm bg-focus text-white'
            : 'rounded-bl-sm bg-white text-dark'
        }`}
      >
        {enAttente ? (
          <span className="flex items-center gap-1 py-1" aria-label="L'assistant écrit">
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
            <span className="chat-typing-dot" />
          </span>
        ) : (
          message.texte
        )}

        {message.escalade && (
          <div className="mt-2 border-t border-gray-200 pt-1.5 text-xs italic text-gray-700">
            Transmis à un conseiller
            {message.referenceTicket ? ` (ticket ${message.referenceTicket})` : ''}.
          </div>
        )}

        {message.citations && message.citations.length > 0 && (
          <div className="mt-2 border-t border-gray-200 pt-1.5 text-xs text-gray-700">
            <span className="font-medium">Sources&nbsp;:</span>
            <ol className="mt-0.5 list-decimal pl-4">
              {message.citations.map((c) => {
                const libelle = c.titre ?? c.cheminSource
                return (
                  <li key={c.index}>
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline underline-offset-2 hover:text-focus"
                      >
                        {libelle}
                      </a>
                    ) : (
                      libelle
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}

function IconeChat() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function IconeFermer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function IconePlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function IconeEnvoyer() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  )
}
