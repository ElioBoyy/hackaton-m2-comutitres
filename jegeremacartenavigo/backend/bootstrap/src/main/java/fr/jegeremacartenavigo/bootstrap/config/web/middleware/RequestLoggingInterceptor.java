package fr.jegeremacartenavigo.bootstrap.config.web.middleware;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Middleware web (HandlerInterceptor) : trace chaque requete HTTP (methode, URI,
 * statut, duree). Complementaire du {@link CorrelationIdFilter} : agit au niveau
 * Spring MVC plutot qu'au niveau servlet.
 */
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final Logger log = LoggerFactory.getLogger(RequestLoggingInterceptor.class);
    private static final String START_ATTR = "requestStartNanos";

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_ATTR, System.nanoTime());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        Object start = request.getAttribute(START_ATTR);
        long ms = (start instanceof Long startNanos)
                ? (System.nanoTime() - startNanos) / 1_000_000
                : -1;
        log.info("{} {} -> {} ({} ms)",
                request.getMethod(), request.getRequestURI(), response.getStatus(), ms);
    }
}
