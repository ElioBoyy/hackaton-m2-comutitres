package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Intention de creer ou completer un Dossier, validee par
 * {@code CreerDossierHandler} avant d'etre passee au port
 * {@link fr.jegeremacartenavigo.domain.dossier.port.DossierRepository}.
 *
 * <p>{@code idUtilisateurConnecte} est toujours porteur ET payeur du dossier
 * (cf. CONTEXT.md / decision DemandePour) : un {@code TIERS} n'est qu'un nom
 * en texte libre, pas un veritable utilisateur.
 *
 * <p>{@code idDossierExistant} permet de completer un brouillon deja
 * sauvegarde (statut {@code EN_ATTENTE_PAIEMENT}) plutot que d'en creer un
 * nouveau - evite les doublons quand l'usager sauvegarde puis revient payer
 * plus tard. Null = creation d'un nouveau dossier.
 */
public record NouveauDossier(
        Integer idUtilisateurConnecte,
        Integer idDossierExistant,
        DemandePour demandePour,
        String beneficiaireNomComplet,
        SituationDemande situation,
        String situationPrecision,
        boolean boursier,
        String codeTypeAbonnement,
        String cheminPieceIdentite,
        String cheminCertificatScolarite,
        String cheminNotificationBourse,
        ModePaiementDossier modePaiement
) {
}
