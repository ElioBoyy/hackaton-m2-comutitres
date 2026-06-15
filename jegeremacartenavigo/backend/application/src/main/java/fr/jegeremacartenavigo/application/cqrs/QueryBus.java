package fr.jegeremacartenavigo.application.cqrs;

/**
 * Point d'entree cote lecture : route une {@link Query} vers son
 * {@link QueryHandler}, en passant par le pipeline de middleware.
 */
public interface QueryBus {

    <R extends Response> R ask(Query<R> query);
}
