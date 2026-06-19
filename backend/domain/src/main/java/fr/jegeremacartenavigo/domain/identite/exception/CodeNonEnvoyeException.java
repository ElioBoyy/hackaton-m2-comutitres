package fr.jegeremacartenavigo.domain.identite.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand on tente de verifier un code alors qu'aucun PIN n'a ete envoye
 * (ou que celui-ci a expire / ete consomme). Mappee en 422.
 */
public class CodeNonEnvoyeException extends DomainException {

    public CodeNonEnvoyeException() {
        super("Aucun code n'a ete envoye. Demandez un nouveau code.");
    }
}
