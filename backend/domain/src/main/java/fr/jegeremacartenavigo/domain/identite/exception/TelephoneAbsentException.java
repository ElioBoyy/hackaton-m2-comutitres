package fr.jegeremacartenavigo.domain.identite.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand on tente d'envoyer un code OTP a un utilisateur qui n'a pas de
 * numero de telephone enregistre. Mappee en 422.
 */
public class TelephoneAbsentException extends DomainException {

    public TelephoneAbsentException() {
        super("Aucun numero de telephone enregistre pour cet utilisateur.");
    }
}
