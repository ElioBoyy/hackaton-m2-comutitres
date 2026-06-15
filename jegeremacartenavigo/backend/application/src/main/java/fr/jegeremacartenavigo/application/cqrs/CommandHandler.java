package fr.jegeremacartenavigo.application.cqrs;

/**
 * Handler d'une {@link Command}. Une commande = exactement un handler.
 *
 * <p>Implementations attendues comme beans Spring dans la couche application
 * (use cases), resolus automatiquement par le bus.
 *
 * @param <C> type de commande traitee
 * @param <R> type de reponse produite
 */
public interface CommandHandler<C extends Command<R>, R extends Response>
        extends RequestHandler<C, R> {
}
