package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Filtre de la liste de dossiers du tableau de bord. Par defaut on ne montre
 * que les dossiers actifs ; {@code ALL} leve ce filtre (y compris
 * rejetes/clos), choisi par l'utilisateur via un parametre explicite (valeurs
 * exposees en anglais cote API : {@code caseFilter=ACTIVE|ALL}).
 */
public enum FiltreDossiers {
    ACTIVE,
    ALL
}
