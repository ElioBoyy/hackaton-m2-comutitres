package fr.jegeremacartenavigo.domain.identite.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand le service OTP externe (Infobip) est indisponible : cle absente,
 * panne reseau ou reponse en erreur du fournisseur. Mappee en 503.
 */
public class ServiceOtpIndisponibleException extends DomainException {

    public ServiceOtpIndisponibleException(String message) {
        super(message);
    }

    public ServiceOtpIndisponibleException(String message, Throwable cause) {
        super(message, cause);
    }
}
