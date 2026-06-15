package fr.jegeremacartenavigo.infrastructure.cqrs;

import fr.jegeremacartenavigo.application.cqrs.Request;
import fr.jegeremacartenavigo.application.cqrs.RequestHandler;
import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.application.cqrs.middleware.PipelineBehavior;
import fr.jegeremacartenavigo.application.cqrs.middleware.RequestNext;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

/**
 * Coeur du mediateur CQRS : resout le handler d'une requete puis l'execute a
 * travers la chaine de {@link PipelineBehavior} (middleware applicatif), triee
 * par {@link PipelineBehavior#order()}.
 *
 * <p>Partage par {@link SpringCommandBus} et {@link SpringQueryBus}.
 */
@Component
public class RequestDispatcher {

    private final HandlerRegistry registry;
    private final List<PipelineBehavior> behaviors;

    public RequestDispatcher(HandlerRegistry registry, ObjectProvider<PipelineBehavior> behaviors) {
        this.registry = registry;
        // Ordre stable : du plus externe (order le plus bas) au plus interne.
        this.behaviors = behaviors.stream()
                .sorted(Comparator.comparingInt(PipelineBehavior::order))
                .toList();
    }

    public <R extends Response> R dispatch(Request<R> request) {
        RequestHandler<Request<R>, R> handler = registry.resolve(request.getClass());

        RequestNext<R> chain = () -> handler.handle(request);
        for (int i = behaviors.size() - 1; i >= 0; i--) {
            PipelineBehavior behavior = behaviors.get(i);
            RequestNext<R> next = chain;
            chain = () -> behavior.handle(request, next);
        }
        return chain.proceed();
    }
}
