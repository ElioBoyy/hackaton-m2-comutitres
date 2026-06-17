import type { WizardState } from '~/store/wizardSlice'

// PreVerificationIA (cf. CONTEXT.md) : le dossier n'est considere complet
// que si la piece d'identite est fournie, et si Situation = ETUDIANT, le
// certificat de scolarite aussi. La notification de bourse reste toujours
// facultative, meme pour la completude du dossier.
export function piecesSontCompletes(wizard: WizardState): boolean {
  const justificatifRequis = wizard.situation === 'ETUDIANT'
  return (
    Boolean(wizard.pieceIdentiteNomFichier) &&
    (!justificatifRequis || Boolean(wizard.justificatifEtudiantNomFichier))
  )
}
