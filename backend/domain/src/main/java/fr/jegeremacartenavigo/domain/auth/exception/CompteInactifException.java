package fr.jegeremacartenavigo.domain.auth.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

public class CompteInactifException extends DomainException {

    public CompteInactifException() {
        super("Compte inactif ou suspendu.");
    }
}
