package fr.jegeremacartenavigo.domain.rag.model;

/**
 * Un morceau de document pret a etre vectorise (resultat du decoupage).
 *
 * @param ordre            position du fragment dans le document (0-based)
 * @param titreSection     chemin des titres markdown menant a ce fragment
 *                         (ex: "Forfait Navigo Annuel > Tarifs"), sinon null
 * @param contenu          texte du fragment
 * @param nbTokensEstimes  estimation grossiere du nombre de tokens
 */
public record Fragment(
        int ordre,
        String titreSection,
        String contenu,
        int nbTokensEstimes
) {
}
