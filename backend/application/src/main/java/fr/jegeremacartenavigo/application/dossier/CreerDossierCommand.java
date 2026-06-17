package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import fr.jegeremacartenavigo.domain.dossier.model.DemandePour;
import fr.jegeremacartenavigo.domain.dossier.model.ModePaiementDossier;
import fr.jegeremacartenavigo.domain.dossier.model.SituationDemande;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Commande issue des ecrans Resultat/Recapitulatif (bouton "Sauvegarder et
 * quitter") ou Paiement du RecommendationWizard front (cf. CONTEXT.md).
 * {@code idUtilisateurConnecte} est toujours fixe par le controller a partir
 * du JWT, jamais fourni par le client.
 *
 * <p>{@code modePaiement} est optionnel : absent, le dossier est sauvegarde
 * en brouillon (statut {@code EN_ATTENTE_PAIEMENT}, aucun Paiement cree) ;
 * present, le dossier passe directement {@code ACTIF} avec un Paiement mock
 * "valide" (cf. CreerDossierHandler / DossierRepositoryAdapter). Les pieces
 * (CNI, certificat de scolarite) ne sont obligatoires que dans ce second cas
 * - un brouillon peut etre sauvegarde avant meme de les avoir deposees.
 *
 * <p>{@code idDossierExistant} (optionnel) complete un brouillon deja
 * sauvegarde plutot que d'en creer un nouveau - evite les doublons.
 */
public record CreerDossierCommand(
        @NotNull Integer idUtilisateurConnecte,
        Integer idDossierExistant,
        @NotNull DemandePour demandePour,
        String beneficiaireNomComplet,
        @NotNull SituationDemande situation,
        String situationPrecision,
        boolean boursier,
        @NotBlank String codeTypeAbonnement,
        String cheminPieceIdentite,
        String cheminCertificatScolarite,
        String cheminNotificationBourse,
        ModePaiementDossier modePaiement
) implements Command<DossierResponse> {
}
