package fr.jegeremacartenavigo.domain.auth.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

public class EmailDejaUtiliseException extends DomainException {

    public EmailDejaUtiliseException() {
        super("Un compte existe deja pour cet email.");
    }
}
