package fr.jegeremacartenavigo.infrastructure.cqrs;

/**
 * Levee lorsqu'aucun handler (ou plus d'un) n'est enregistre pour un type de
 * requete donne. C'est une erreur de configuration / cablage, pas une erreur
 * metier.
 */
public class NoHandlerFoundException extends RuntimeException {

    public NoHandlerFoundException(String message) {
        super(message);
    }
}
