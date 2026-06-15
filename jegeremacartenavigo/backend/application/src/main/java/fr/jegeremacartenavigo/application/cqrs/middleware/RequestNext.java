package fr.jegeremacartenavigo.application.cqrs.middleware;

import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * Maillon suivant du pipeline. Un {@link PipelineBehavior} appelle
 * {@code proceed()} pour passer la main au middleware suivant, ou au handler
 * final si c'est le dernier.
 *
 * @param <R> type de reponse
 */
@FunctionalInterface
public interface RequestNext<R extends Response> {

    R proceed();
}
