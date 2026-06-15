package fr.jegeremacartenavigo.infrastructure.cqrs;

import fr.jegeremacartenavigo.application.cqrs.Query;
import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.cqrs.Response;
import org.springframework.stereotype.Component;

/**
 * Implementation Spring du {@link QueryBus} : delegue au
 * {@link RequestDispatcher}.
 */
@Component
public class SpringQueryBus implements QueryBus {

    private final RequestDispatcher dispatcher;

    public SpringQueryBus(RequestDispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }

    @Override
    public <R extends Response> R ask(Query<R> query) {
        return dispatcher.dispatch(query);
    }
}
