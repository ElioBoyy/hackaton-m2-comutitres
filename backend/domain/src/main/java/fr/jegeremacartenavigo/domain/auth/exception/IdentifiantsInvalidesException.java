package fr.jegeremacartenavigo.domain.auth.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee aussi bien pour un email inconnu que pour un mot de passe errone, pour
 * eviter d'enumerer les comptes existants.
 */
public class IdentifiantsInvalidesException extends DomainException {

    public IdentifiantsInvalidesException() {
        super("Email ou mot de passe invalide.");
    }
}
