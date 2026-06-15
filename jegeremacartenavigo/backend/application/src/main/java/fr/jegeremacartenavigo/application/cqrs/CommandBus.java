package fr.jegeremacartenavigo.application.cqrs;

/**
 * Point d'entree cote ecriture : route une {@link Command} vers son
 * {@link CommandHandler}, en passant par le pipeline de middleware.
 *
 * <p>Interface volontairement dans la couche application (sans Spring).
 * L'implementation concrete (resolution des handlers via le conteneur) vit
 * dans la couche infrastructure.
 */
public interface CommandBus {

    <R extends Response> R send(Command<R> command);
}
