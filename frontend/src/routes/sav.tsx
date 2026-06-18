import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, MessageSquare, Plus, Send } from 'lucide-react'
import { isAuthenticated, me } from '~/lib/auth'
import { DashboardLayout } from '~/components/DashboardLayout'
import { Button } from '~/components/Button'
import { Field } from '~/components/Field'
import { StatusBadge } from '~/components/backoffice/StatusBadge'
import { m } from '~/paraglide/messages'
import {
  CATEGORIES_SAV,
  MOCK_RECLAMATIONS,
  categoriePourStatut,
  libelleCategorie,
  libelleStatut,
  type CategorieReclamation,
  type Reclamation,
} from '~/lib/sav'

export const Route = createFileRoute('/sav')({
  component: SavPage,
})

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function SavPage() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('')
  const [reclamations, setReclamations] = useState<Reclamation[]>(MOCK_RECLAMATIONS)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})

  const [categorie, setCategorie] = useState<CategorieReclamation>('PAIEMENT')
  const [objet, setObjet] = useState('')
  const [description, setDescription] = useState('')
  const [objetError, setObjetError] = useState<string | undefined>()
  const [descError, setDescError] = useState<string | undefined>()
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: '/login' })
      return
    }
    me()
      .then((u) => setUserName(`${u.prenom} ${u.nom}`))
      .catch(() => {})
  }, [navigate])

  function handleToggleForm() {
    if (showForm) {
      setObjet('')
      setDescription('')
      setCategorie('PAIEMENT')
      setObjetError(undefined)
      setDescError(undefined)
    }
    setShowForm((v) => !v)
  }

  function handleSubmitForm(e: React.FormEvent) {
    e.preventDefault()
    let valid = true
    if (!objet.trim()) {
      setObjetError(m.sav_form_subject_required())
      valid = false
    } else {
      setObjetError(undefined)
    }
    if (!description.trim()) {
      setDescError(m.sav_form_desc_required())
      valid = false
    } else {
      setDescError(undefined)
    }
    if (!valid) return

    const newRec: Reclamation = {
      id: `r${reclamations.length + 1}`,
      reference: `REC-2026-00${reclamations.length + 1}`,
      categorie,
      objet: objet.trim(),
      dateCreation: new Date().toISOString(),
      dateMiseAJour: new Date().toISOString(),
      statut: 'OUVERT',
      messages: [
        {
          id: `m${Date.now()}`,
          auteur: 'CLIENT',
          contenu: description.trim(),
          date: new Date().toISOString(),
        },
      ],
    }

    setReclamations((prev) => [newRec, ...prev])
    setExpandedId(newRec.id)
    setObjet('')
    setDescription('')
    setCategorie('PAIEMENT')
    setShowForm(false)
    setSuccessMsg(m.sav_form_success())
    setTimeout(() => setSuccessMsg(null), 6000)
  }

  function handleSendReply(recId: string) {
    const text = replyTexts[recId]?.trim()
    if (!text) return
    setReclamations((prev) =>
      prev.map((r) =>
        r.id !== recId
          ? r
          : {
              ...r,
              dateMiseAJour: new Date().toISOString(),
              messages: [
                ...r.messages,
                {
                  id: `m${Date.now()}`,
                  auteur: 'CLIENT',
                  contenu: text,
                  date: new Date().toISOString(),
                },
              ],
            },
      ),
    )
    setReplyTexts((prev) => ({ ...prev, [recId]: '' }))
  }

  return (
    <DashboardLayout title={m.sav_title()} userName={userName} alertes={[]}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">

        {/* En-tête + bouton nouvelle réclamation */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-lg font-semibold text-gray-900">
              {m.sav_title()}
            </h2>
            <p className="mt-0.5 text-sm text-gray-700">{m.sav_subtitle()}</p>
          </div>
          <Button
            variant={showForm ? 'ghost' : 'primary'}
            className="w-auto"
            onClick={handleToggleForm}
            aria-expanded={showForm}
          >
            <span className="flex items-center gap-2">
              <Plus size={16} aria-hidden="true" className={showForm ? 'rotate-45 transition-transform' : 'transition-transform'} />
              {showForm ? m.sav_cancel() : m.sav_new_btn()}
            </span>
          </Button>
        </div>

        {/* Confirmation d'envoi */}
        {successMsg && (
          <div
            role="status"
            aria-live="polite"
            className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-sm font-medium text-success"
          >
            {successMsg}
          </div>
        )}

        {/* Formulaire nouvelle réclamation */}
        {showForm && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 className="mb-5 font-heading text-base font-semibold text-gray-900">
              {m.sav_new_btn()}
            </h3>
            <form onSubmit={handleSubmitForm} noValidate className="flex flex-col gap-4">

              {/* Catégorie */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sav-cat" className="text-sm font-medium text-dark">
                  {m.sav_form_category()}
                </label>
                <select
                  id="sav-cat"
                  value={categorie}
                  onChange={(e) => setCategorie(e.target.value as CategorieReclamation)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-dark outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                >
                  {CATEGORIES_SAV.map((cat) => (
                    <option key={cat} value={cat}>
                      {libelleCategorie(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objet */}
              <Field
                label={m.sav_form_subject()}
                value={objet}
                onChange={(e) => setObjet(e.target.value)}
                error={objetError}
                placeholder={m.sav_form_subject_placeholder()}
                maxLength={120}
              />

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sav-desc" className="text-sm font-medium text-dark">
                  {m.sav_form_description()}
                </label>
                <textarea
                  id="sav-desc"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={m.sav_form_desc_placeholder()}
                  aria-invalid={descError ? true : undefined}
                  aria-describedby={descError ? 'sav-desc-error' : undefined}
                  className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-base text-dark placeholder-gray-700 outline-none transition focus:ring-2 ${
                    descError
                      ? 'border-danger focus:border-danger focus:ring-danger/20'
                      : 'border-gray-300 focus:border-primary focus:ring-primary/25'
                  }`}
                />
                {descError && (
                  <p id="sav-desc-error" role="alert" className="text-xs text-danger">
                    {descError}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-1">
                <Button type="submit" className="flex-1 sm:w-auto sm:flex-none">
                  {m.sav_submit()}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 sm:w-auto sm:flex-none"
                  onClick={handleToggleForm}
                >
                  {m.sav_cancel()}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des réclamations */}
        <section aria-labelledby="reclamations-titre">
          <h2 id="reclamations-titre" className="sr-only">
            {m.sav_list_title()}
          </h2>

          {reclamations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
              <MessageSquare size={36} className="text-gray-300" aria-hidden="true" />
              <p className="font-heading text-base font-semibold text-gray-900">
                {m.sav_empty_title()}
              </p>
              <p className="text-sm text-gray-700">{m.sav_empty_desc()}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3" role="list" aria-label={m.sav_list_title()}>
              {reclamations.map((rec) => {
                const expanded = expandedId === rec.id
                return (
                  <article
                    key={rec.id}
                    role="listitem"
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                  >
                    {/* En-tête accordéon */}
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition hover:bg-blue-pale focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary/30"
                      onClick={() => setExpandedId((prev) => (prev === rec.id ? null : rec.id))}
                      aria-expanded={expanded}
                      aria-controls={`rec-detail-${rec.id}`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-gray-700">{rec.reference}</span>
                          <StatusBadge
                            libelle={libelleStatut(rec.statut)}
                            categorie={categoriePourStatut(rec.statut)}
                          />
                        </div>
                        <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                          {rec.objet}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-700">
                          {libelleCategorie(rec.categorie)} · {formatDate(rec.dateMiseAJour)}
                        </p>
                      </div>
                      {expanded ? (
                        <ChevronUp size={18} className="shrink-0 text-gray-700" aria-hidden="true" />
                      ) : (
                        <ChevronDown size={18} className="shrink-0 text-gray-700" aria-hidden="true" />
                      )}
                    </button>

                    {/* Détail : fil de messages */}
                    {expanded && (
                      <div id={`rec-detail-${rec.id}`} className="border-t border-gray-200 p-4">
                        <div
                          className="flex flex-col gap-4"
                          role="list"
                          aria-label="Fil de messages"
                        >
                          {rec.messages.map((msg) => (
                            <div
                              key={msg.id}
                              role="listitem"
                              className={`flex flex-col gap-1 ${msg.auteur === 'CLIENT' ? 'items-end' : 'items-start'}`}
                            >
                              <span className="text-xs font-medium text-gray-700">
                                {msg.auteur === 'CLIENT'
                                  ? m.sav_your_message()
                                  : m.sav_agent_reply()}
                              </span>
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                                  msg.auteur === 'CLIENT'
                                    ? 'rounded-tr-sm bg-primary text-white'
                                    : 'rounded-tl-sm bg-gray-100 text-dark'
                                }`}
                              >
                                {msg.contenu}
                              </div>
                              <time dateTime={msg.date} className="text-xs text-gray-700">
                                {formatDate(msg.date)}
                              </time>
                            </div>
                          ))}
                        </div>

                        {/* Réponse rapide si ticket actif */}
                        {(rec.statut === 'OUVERT' || rec.statut === 'EN_COURS') && (
                          <div className="mt-4 flex gap-2">
                            <label htmlFor={`reply-${rec.id}`} className="sr-only">
                              {m.sav_add_message()}
                            </label>
                            <input
                              id={`reply-${rec.id}`}
                              type="text"
                              placeholder={m.sav_reply_placeholder()}
                              value={replyTexts[rec.id] ?? ''}
                              onChange={(e) =>
                                setReplyTexts((prev) => ({ ...prev, [rec.id]: e.target.value }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendReply(rec.id)
                              }}
                              className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-dark placeholder-gray-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25"
                            />
                            <button
                              type="button"
                              onClick={() => handleSendReply(rec.id)}
                              aria-label={m.sav_send_reply()}
                              disabled={!replyTexts[rec.id]?.trim()}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white transition hover:bg-focus focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Send size={16} aria-hidden="true" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  )
}
