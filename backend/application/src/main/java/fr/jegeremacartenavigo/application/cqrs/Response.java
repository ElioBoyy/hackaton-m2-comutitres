package fr.jegeremacartenavigo.application.cqrs;

/**
 * Marqueur de toute reponse renvoyee par un handler CQRS.
 *
 * <p>On materialise explicitement le pattern Request / Response : chaque
 * {@link Request} produit une {@code Response}. En pratique, ce sont des
 * {@code record} immuables (DTO applicatifs), distincts des entites du domaine.
 */
public interface Response {
}
