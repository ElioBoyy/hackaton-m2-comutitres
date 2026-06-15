package fr.jegeremacartenavigo.infrastructure.cqrs;

import fr.jegeremacartenavigo.application.cqrs.Command;
import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.cqrs.Response;
import org.springframework.stereotype.Component;

/**
 * Implementation Spring du {@link CommandBus} : delegue au
 * {@link RequestDispatcher}.
 */
@Component
public class SpringCommandBus implements CommandBus {

    private final RequestDispatcher dispatcher;

    public SpringCommandBus(RequestDispatcher dispatcher) {
        this.dispatcher = dispatcher;
    }

    @Override
    public <R extends Response> R send(Command<R> command) {
        return dispatcher.dispatch(command);
    }
}
