package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Filtre de la liste de dossiers du tableau de bord.
 *
 * <ul>
 *   <li>{@code ACTIVE} — dossiers aboutis (VALIDE, ACTIF) : l'abonnement est en vigueur.</li>
 *   <li>{@code EN_COURS} — dossiers en traitement (BROUILLON, SOUMIS, PIECES_MANQUANTES,
 *       EN_VERIFICATION, PIECES_VALIDEES, EN_ATTENTE_PAIEMENT, RESILIATION_EN_COURS) :
 *       la demande est en attente de validation.</li>
 *   <li>{@code FERME} — dossiers clos ou refusés (RESILIE, EXPIRE, REJETE, SUSPENDU).</li>
 *   <li>{@code ALL} — tous les dossiers sans filtre (usage interne/backoffice).</li>
 * </ul>
 */
public enum FiltreDossiers {
    ACTIVE,
    EN_COURS,
    FERME,
    ALL
}
