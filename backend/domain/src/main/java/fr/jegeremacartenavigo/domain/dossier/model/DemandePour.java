package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Indique si la demande de Dossier est faite par l'utilisateur connecte pour
 * lui-meme, ou pour un tiers (ex. un enfant). Correspond au PourQui du
 * RecommendationWizard front (cf. CONTEXT.md).
 *
 * <p>Pour cette iteration, le tiers n'a pas de compte {@code Utilisateur} : le
 * porteur/payeur du dossier reste toujours l'utilisateur connecte, seul le nom
 * du beneficiaire est conserve en texte libre.
 */
public enum DemandePour {
    MOI,
    TIERS
}
