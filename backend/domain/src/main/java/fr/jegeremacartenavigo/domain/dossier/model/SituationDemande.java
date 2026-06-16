package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Situation de l'usager au sens du RecommendationWizard front (cf.
 * CONTEXT.md). Stockee en texte libre sur le Dossier plutot que reliee a la
 * table {@code situation}, qui n'est peuplee qu'en environnement seede.
 */
public enum SituationDemande {
    ETUDIANT,
    ACTIF,
    DEMANDEUR_EMPLOI,
    RETRAITE,
    ALTERNANCE,
    AUTRE
}
