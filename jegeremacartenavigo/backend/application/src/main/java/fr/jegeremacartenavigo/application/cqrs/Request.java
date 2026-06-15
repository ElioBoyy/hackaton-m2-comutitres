package fr.jegeremacartenavigo.application.cqrs;

/**
 * Marqueur de tout message d'entree d'un use case, parametre par le type de
 * reponse {@code R} qu'il produit.
 *
 * <p>Un {@code Request} n'est pas execute directement : il est dispatche vers
 * son unique handler via un bus ({@link CommandBus} / {@link QueryBus}).
 *
 * @param <R> type de la reponse produite
 */
public interface Request<R extends Response> {
}
