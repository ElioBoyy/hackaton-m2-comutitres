package fr.jegeremacartenavigo.domain.identite.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand le code OTP saisi est incorrect ou que le nombre de tentatives
 * est epuise. Mappee en 422.
 */
public class CodeVerificationInvalideException extends DomainException {

    public CodeVerificationInvalideException() {
        super("Code incorrect.");
    }

    public CodeVerificationInvalideException(String message) {
        super(message);
    }
}
