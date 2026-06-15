package fr.jegeremacartenavigo.application.cqrs;

/**
 * Handler d'une {@link Query}. Une query = exactement un handler.
 *
 * @param <Q> type de query traitee
 * @param <R> type de reponse produite
 */
public interface QueryHandler<Q extends Query<R>, R extends Response>
        extends RequestHandler<Q, R> {
}
