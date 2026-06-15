package fr.jegeremacartenavigo.domain.exception;

/**
 * Racine de toutes les exceptions metier du domaine.
 *
 * <p>Le domaine ne connait pas HTTP : il leve des exceptions metier neutres.
 * La traduction en codes/reponses HTTP est faite dans la couche infrastructure
 * (voir {@code GlobalExceptionHandler}).
 */
public abstract class DomainException extends RuntimeException {

    protected DomainException(String message) {
        super(message);
    }

    protected DomainException(String message, Throwable cause) {
        super(message, cause);
    }
}
