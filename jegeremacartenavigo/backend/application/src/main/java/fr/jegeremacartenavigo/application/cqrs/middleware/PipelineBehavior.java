package fr.jegeremacartenavigo.application.cqrs.middleware;

import fr.jegeremacartenavigo.application.cqrs.Request;
import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * Middleware applicatif (style "pipeline behavior" facon MediatR) execute autour
 * de CHAQUE requete CQRS, dans l'ordre defini par {@link #order()}.
 *
 * <p>Cas d'usage typiques : logging, validation, transaction, metriques,
 * gestion d'exceptions, idempotence... Tout behavior expose comme bean est
 * branche automatiquement dans le pipeline par le bus.
 */
public interface PipelineBehavior {

    /**
     * @param request requete en cours
     * @param next    maillon suivant (autre behavior, puis le handler)
     * @param <R>     type de reponse
     * @return la reponse, eventuellement transformee
     */
    <R extends Response> R handle(Request<R> request, RequestNext<R> next);

    /**
     * Ordre d'execution : plus petit = plus externe (englobe les autres).
     * Defaut 0.
     */
    default int order() {
        return 0;
    }
}
