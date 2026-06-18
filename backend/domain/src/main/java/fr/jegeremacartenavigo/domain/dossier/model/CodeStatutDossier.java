package fr.jegeremacartenavigo.domain.dossier.model;

/** Codes metier des statuts de dossier (miroir de la table {@code statut_dossier}). */
public enum CodeStatutDossier {
    BROUILLON,
    EN_VERIFICATION,
    INCOMPLET,
    EN_ATTENTE_PAIEMENT,
    VALIDE,
    ACTIF,
    REJETE,
    RESILIE,
    EXPIRE
}
