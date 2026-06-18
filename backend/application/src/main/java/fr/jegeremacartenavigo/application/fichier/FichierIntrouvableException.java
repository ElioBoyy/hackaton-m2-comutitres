package fr.jegeremacartenavigo.application.fichier;

/**
 * Levee quand un objet stocke n'existe pas (cle absente du bucket). Le
 * controller la traduit en HTTP 404 sans divulguer si la cle existerait
 * pour un autre utilisateur.
 */
public class FichierIntrouvableException extends RuntimeException {
    public FichierIntrouvableException(String cle) {
        super("Fichier introuvable : " + cle);
    }
}
