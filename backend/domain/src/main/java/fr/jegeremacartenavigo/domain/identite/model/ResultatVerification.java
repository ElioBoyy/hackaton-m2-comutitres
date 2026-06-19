package fr.jegeremacartenavigo.domain.identite.model;

/**
 * Resultat d'une tentative de verification d'un code OTP envoye par SMS.
 *
 * @param verifie             vrai si le code saisi correspond au PIN envoye
 * @param tentativesRestantes nombre d'essais restants avant blocage (null si
 *                            l'information n'est pas fournie par le service)
 */
public record ResultatVerification(boolean verifie, Integer tentativesRestantes) {
}
