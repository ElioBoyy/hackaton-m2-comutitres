package fr.jegeremacartenavigo.application.cqrs;

/**
 * Contrat commun a tout handler : recoit un {@link Request} et produit sa
 * {@link Response}. Specialise par {@link CommandHandler} et {@link QueryHandler}.
 *
 * @param <REQ> type de requete traitee
 * @param <R>   type de reponse produite
 */
public interface RequestHandler<REQ extends Request<R>, R extends Response> {

    R handle(REQ request);
}
