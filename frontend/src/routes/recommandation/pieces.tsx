import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { BadgeCheck, GraduationCap, IdCard, Loader2, Receipt, Sparkles } from 'lucide-react'
import * as React from 'react'
import { Button } from '~/components/ui/Button'
import { piecesSontCompletes } from '~/domain/pieces'
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
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" strokeWidth={1.75} />
        <p className="font-heading text-lg font-bold text-dark">
          L'IA pré-vérifie vos pièces...
        </p>
        <p className="text-sm text-gray-700">Cela ne prend que quelques secondes.</p>
      </main>
    )
  }

  if (preVerifie) {
    return (
      <main className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
        <BadgeCheck className="h-10 w-10 text-success" strokeWidth={1.75} />
        <p className="font-heading text-lg font-bold text-dark">Pièces pré-vérifiées</p>
        <p className="text-sm text-gray-700">
          L'IA a fait un premier contrôle de vos documents. La vérification
          définitive reste à effectuer par nos équipes.
        </p>
        <Button onClick={() => navigate({ to: '/recommandation/recapitulatif' })}>
          Continuer
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 py-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight text-dark">
        Vos pièces justificatives
      </h1>
      <p className="text-gray-700">
        Pour finaliser votre demande, déposez les documents suivants.
      </p>

      <ChampFichier
        icon={IdCard}
        label="Pièce d'identité"
        nomFichier={wizard.pieceIdentiteNomFichier}
        onChange={(nom) => dispatch(pieceIdentiteDeposee(nom))}
      />

      {justificatifRequis ? (
        <ChampFichier
          icon={GraduationCap}
          label="Certificat de scolarité (année en cours)"
          nomFichier={wizard.justificatifEtudiantNomFichier}
          onChange={(nom) => dispatch(justificatifEtudiantDepose(nom))}
        />
      ) : null}

      {bourseRequise ? (
        <ChampFichier
          icon={Receipt}
          label="Notification conditionnelle de bourse"
          nomFichier={wizard.notificationBourseNomFichier}
          onChange={(nom) => dispatch(notificationBourseDeposee(nom))}
        />
      ) : null}

      <div className="flex flex-col gap-3">
        <Button onClick={preVerifierAvecIA} disabled={!auMoinsUnePieceDeposee}>
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
            Pré-vérifier avec l'IA
          </span>
        </Button>
        <Button variant="secondary" onClick={continuerSansPreVerification}>
          Continuer sans pré-vérification
        </Button>
        {!piecesCompletes ? (
          <p className="text-center text-xs text-gray-700">
            Sans l'ensemble de ces pièces, votre dossier ne pourra pas être
            validé. Vous pourrez les ajouter plus tard.
          </p>
        ) : null}
      </div>
    </main>
  )
}

function ChampFichier({
  icon: Icon,
  label,
  nomFichier,
  onChange,
}: {
  icon: typeof IdCard
  label: string
  nomFichier: string | null
  onChange: (nomFichier: string) => void
}) {
  const inputId = React.useId()

  return (
    <label
      htmlFor={inputId}
      className="flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-primary-light"
    >
      <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.75} />
      <div className="flex-1">
        <p className="font-semibold text-dark">{label}</p>
        <p className="text-sm text-gray-700">{nomFichier ?? 'Aucun fichier sélectionné'}</p>
      </div>
      <input
        id={inputId}
        type="file"
        className="hidden"
        onChange={(event) => {
          const fichier = event.target.files?.[0]
          if (fichier) onChange(fichier.name)
        }}
      />
    </label>
  )
}
