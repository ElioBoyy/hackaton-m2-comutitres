package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Vue domaine de la categorie d'un statut de dossier (cf. entite JPA
 * {@code StatutDossier.Categorie} en infrastructure, miroir exact des valeurs).
 * Sert au filtre "dossiers actifs" du tableau de bord : actif = en_cours ou
 * abouti, par opposition a rejete/clos.
 */
public enum CategorieStatutDossier {
    en_cours,
    abouti,
    rejete,
    clos;

    public boolean estActif() {
        return this == en_cours || this == abouti;
    }
}
