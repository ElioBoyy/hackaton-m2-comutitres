import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BadgeCheck, GraduationCap, IdCard, Loader2, Receipt, Sparkles } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/Button'
import { piecesSontCompletes } from '~/domain/pieces'
import { deposerFichier, type TypePiece } from '~/lib/fichier'
import { m } from '~/paraglide/messages'
import { useAppDispatch, useAppSelector } from '~/store/hooks'
import {
  justificatifEtudiantDepose,
  notificationBourseDeposee,
  pieceIdentiteDeposee,
  verificationIAEffectuee,
} from '~/store/wizardSlice'

export const Route = createFileRoute('/recommandation/pieces')({
  component: PiecesStep,
})

// Duree simulee de la PreVerificationIA (cf. CONTEXT.md) : pas de vrai appel
// reseau, juste un mock de chargement pour donner du feedback a l'usager.
const DUREE_PRE_VERIFICATION_IA_MS = 2000

function PiecesStep() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const wizard = useAppSelector((state) => state.wizard)
  const [enPreVerification, setEnPreVerification] = React.useState(false)
  const [preVerifie, setPreVerifie] = React.useState(false)

  const pourQui = wizard.pourQui
  const justificatifRequis = wizard.situation === 'ETUDIANT'
  const bourseRequise = wizard.situation === 'ETUDIANT' && wizard.boursier
  const piecesCompletes = piecesSontCompletes(wizard)
  // La pre-verification IA n'a besoin que d'au moins un document a
  // analyser (CNI, certificat de scolarite ou notification de bourse).
  const auMoinsUnePieceDeposee = Boolean(
    wizard.pieceIdentiteNomFichier ||
      wizard.justificatifEtudiantNomFichier ||
      wizard.notificationBourseNomFichier,
  )

  function preVerifierAvecIA() {
    setEnPreVerification(true)
    setTimeout(() => {
      setEnPreVerification(false)
      setPreVerifie(true)
      dispatch(verificationIAEffectuee())
    }, DUREE_PRE_VERIFICATION_IA_MS)
  }

  function continuerSansPreVerification() {
    navigate({ to: '/recommandation/recapitulatif' })
  }

  if (enPreVerification) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="font-heading text-lg font-bold text-dark">
          {pourQui === 'TIERS' ? m.wizard_pieces_loading_other() : m.wizard_pieces_loading_self()}
        </p>
        <p className="text-sm text-gray-700">{m.wizard_pieces_loading_subtitle()}</p>
      </main>
    )
  }

  if (preVerifie) {
    return (
      <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-24 text-center">
        <BadgeCheck className="h-10 w-10 text-success" strokeWidth={1.75} />
        <p className="font-heading text-lg font-bold text-dark">{m.wizard_pieces_verified_title()}</p>
        <p className="text-sm text-gray-700">
          {pourQui === 'TIERS' ? m.wizard_pieces_verified_other() : m.wizard_pieces_verified_self()}
        </p>
        <Button onClick={() => navigate({ to: '/recommandation/recapitulatif' })}>
          {m.wizard_pieces_verified_continue()}
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">
        {pourQui === 'TIERS' ? m.wizard_pieces_title_other() : m.wizard_pieces_title_self()}
      </h1>
      <p className="text-gray-700">
        {pourQui === 'TIERS' ? m.wizard_pieces_subtitle_other() : m.wizard_pieces_subtitle_self()}
      </p>

      <ChampFichier
        icon={IdCard}
        label={m.wizard_pieces_id_card()}
        type="PIECE_IDENTITE"
        nomFichier={wizard.pieceIdentiteNomFichier}
        onDepose={(payload) => dispatch(pieceIdentiteDeposee(payload))}
      />

      {justificatifRequis ? (
        <ChampFichier
          icon={GraduationCap}
          label={m.wizard_pieces_school_cert()}
          type="CERTIFICAT_SCOLARITE"
          nomFichier={wizard.justificatifEtudiantNomFichier}
          onDepose={(payload) => dispatch(justificatifEtudiantDepose(payload))}
        />
      ) : null}

      {bourseRequise ? (
        <ChampFichier
          icon={Receipt}
          label={m.wizard_pieces_scholarship_notif()}
          type="AVIS_IMPOSITION"
          nomFichier={wizard.notificationBourseNomFichier}
          onDepose={(payload) => dispatch(notificationBourseDeposee(payload))}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <Button onClick={preVerifierAvecIA} disabled={!auMoinsUnePieceDeposee}>
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            {m.wizard_pieces_preverify()}
          </span>
        </Button>
        <Button variant="ghost" onClick={continuerSansPreVerification}>
          {m.wizard_pieces_continue_no_verify()}
        </Button>
        {!piecesCompletes ? (
          <p className="text-center text-xs text-gray-700">
            {m.wizard_pieces_incomplete()}
          </p>
        ) : null}
      </div>
    </main>
  )
}

function ChampFichier({
  icon: Icon,
  label,
  type,
  nomFichier,
  onDepose,
}: {
  icon: typeof IdCard
  label: string
  type: TypePiece
  nomFichier: string | null
  onDepose: (payload: { nomFichier: string; cleObjet: string }) => void
}) {
  const inputId = React.useId()
  const [enUpload, setEnUpload] = React.useState(false)
  const [erreur, setErreur] = React.useState<string | null>(null)

  async function uploader(fichier: File) {
    setEnUpload(true)
    setErreur(null)
    try {
      const reponse = await deposerFichier(fichier, type)
      onDepose({ nomFichier: reponse.nomOriginal ?? fichier.name, cleObjet: reponse.cle })
    } catch {
      setErreur(m.wizard_pieces_upload_error())
    } finally {
      setEnUpload(false)
    }
  }

  return (
    <label
      htmlFor={inputId}
      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-primary-light"
    >
      <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
      <div className="flex-1">
        <p className="font-semibold text-dark">{label}</p>
        <p className="text-sm text-gray-700">
          {enUpload ? m.wizard_pieces_uploading() : (nomFichier ?? m.wizard_pieces_no_file())}
        </p>
        {erreur ? <p className="text-xs text-danger">{erreur}</p> : null}
      </div>
      {enUpload ? <Loader2 className="h-5 w-5 animate-spin text-primary" strokeWidth={1.75} /> : null}
      <input
        id={inputId}
        type="file"
        className="hidden"
        disabled={enUpload}
        onChange={(event) => {
          const fichier = event.target.files?.[0]
          if (fichier) void uploader(fichier)
        }}
      />
    </label>
  )
}
