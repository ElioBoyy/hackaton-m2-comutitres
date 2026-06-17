package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Sous-ensemble de {@code Notification.TypeNotification} pertinent pour le
 * bandeau d'alertes du dashboard : seules les reductions/remboursements y
 * apparaissent (pas document_manquant, rappel_paiement, etc.).
 */
public enum TypeAlerte {
    NOUVELLE_REDUCTION_DISPONIBLE,
    REMBOURSEMENT_DISPONIBLE
}
