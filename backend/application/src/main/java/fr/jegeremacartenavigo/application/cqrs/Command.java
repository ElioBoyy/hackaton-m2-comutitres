package fr.jegeremacartenavigo.application.cqrs;

/**
 * Cote ecriture du CQRS : une intention de modifier l'etat du systeme.
 *
 * <p>Une commande est dispatchee via le {@link CommandBus} et traitee par un
 * unique {@link CommandHandler}.
 *
 * @param <R> type de la reponse (souvent un accuse / identifiant cree)
 */
public interface Command<R extends Response> extends Request<R> {
}
