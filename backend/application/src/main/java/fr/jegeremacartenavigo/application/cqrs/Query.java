package fr.jegeremacartenavigo.application.cqrs;

/**
 * Cote lecture du CQRS : une demande de donnees, sans effet de bord.
 *
 * <p>Une query est dispatchee via le {@link QueryBus} et traitee par un unique
 * {@link QueryHandler}.
 *
 * @param <R> type de la reponse (les donnees lues)
 */
public interface Query<R extends Response> extends Request<R> {
}
