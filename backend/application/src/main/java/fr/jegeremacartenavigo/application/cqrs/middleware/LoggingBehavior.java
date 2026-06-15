package fr.jegeremacartenavigo.application.cqrs.middleware;

import fr.jegeremacartenavigo.application.cqrs.Request;
import fr.jegeremacartenavigo.application.cqrs.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Middleware le plus externe (order 0) : trace l'entree/sortie de chaque
 * requete CQRS et mesure sa duree. N'a aucune dependance Spring ; il est
 * expose comme bean par {@code CqrsConfig} dans la couche infrastructure.
 */
public final class LoggingBehavior implements PipelineBehavior {

    private static final Logger log = LoggerFactory.getLogger(LoggingBehavior.class);

    @Override
    public int order() {
        return 0;
    }

    @Override
    public <R extends Response> R handle(Request<R> request, RequestNext<R> next) {
        String name = request.getClass().getSimpleName();
        long start = System.nanoTime();
        log.debug("-> {}", name);
        try {
            R response = next.proceed();
            long ms = (System.nanoTime() - start) / 1_000_000;
            log.debug("<- {} ({} ms)", name, ms);
            return response;
        } catch (RuntimeException ex) {
            long ms = (System.nanoTime() - start) / 1_000_000;
            log.warn("x  {} a echoue apres {} ms : {}", name, ms, ex.toString());
            throw ex;
        }
    }
}
