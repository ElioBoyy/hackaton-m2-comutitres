package fr.jegeremacartenavigo.infrastructure.cqrs;

import fr.jegeremacartenavigo.application.cqrs.Request;
import fr.jegeremacartenavigo.application.cqrs.RequestHandler;
import fr.jegeremacartenavigo.application.cqrs.Response;
import org.springframework.beans.factory.ListableBeanFactory;
import org.springframework.core.ResolvableType;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Resout, pour un type de requete, l'unique {@link RequestHandler} correspondant
 * parmi les beans du conteneur Spring. La correspondance se fait sur le premier
 * parametre generique du handler ({@code RequestHandler<REQ, R>}).
 *
 * <p>Le resultat est mis en cache : la resolution n'a lieu qu'une fois par type.
 */
@Component
public class HandlerRegistry {

    private final ListableBeanFactory beanFactory;
    private final Map<Class<?>, RequestHandler<?, ?>> cache = new ConcurrentHashMap<>();

    public HandlerRegistry(ListableBeanFactory beanFactory) {
        this.beanFactory = beanFactory;
    }

    @SuppressWarnings("unchecked")
    public <R extends Response> RequestHandler<Request<R>, R> resolve(Class<?> requestType) {
        RequestHandler<?, ?> handler = cache.computeIfAbsent(requestType, this::lookup);
        return (RequestHandler<Request<R>, R>) handler;
    }

    private RequestHandler<?, ?> lookup(Class<?> requestType) {
        RequestHandler<?, ?> found = null;
        for (String beanName : beanFactory.getBeanNamesForType(RequestHandler.class)) {
            Class<?> beanType = beanFactory.getType(beanName);
            if (beanType == null) {
                continue;
            }
            Class<?> handled = ResolvableType.forClass(beanType)
                    .as(RequestHandler.class)
                    .getGeneric(0)
                    .resolve();
            if (handled != null && handled.isAssignableFrom(requestType)) {
                if (found != null) {
                    throw new NoHandlerFoundException(
                            "Plusieurs handlers trouves pour " + requestType.getName());
                }
                found = (RequestHandler<?, ?>) beanFactory.getBean(beanName);
            }
        }
        if (found == null) {
            throw new NoHandlerFoundException(
                    "Aucun handler enregistre pour " + requestType.getName());
        }
        return found;
    }
}
