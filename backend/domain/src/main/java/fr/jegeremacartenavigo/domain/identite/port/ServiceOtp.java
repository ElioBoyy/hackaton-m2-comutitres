package fr.jegeremacartenavigo.domain.identite.port;

import fr.jegeremacartenavigo.domain.identite.model.ResultatVerification;

/**
 * Port secondaire : service externe d'envoi et de verification d'un code OTP
 * par SMS (implementation Infobip 2FA dans la couche infrastructure).
 */
public interface ServiceOtp {

    /**
     * Envoie un code PIN par SMS au numero donne.
     *
     * @param telephone numero au format saisi par l'utilisateur (la
     *                  normalisation au format MSISDN est a la charge de
     *                  l'implementation)
     * @return l'identifiant du PIN (a conserver pour la verification)
     */
    String envoyerCode(String telephone);

    /**
     * Verifie un code saisi par l'utilisateur contre le PIN precedemment envoye.
     *
     * @param pinId identifiant retourne par {@link #envoyerCode(String)}
     * @param code  code a 4-8 chiffres saisi par l'utilisateur
     */
    ResultatVerification verifierCode(String pinId, String code);
}
