package fr.jegeremacartenavigo.application.identite;

import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * @param verifie             vrai si le code etait correct
 * @param tentativesRestantes essais restants si le code etait faux (peut etre null)
 */
public record VerificationResponse(boolean verifie, Integer tentativesRestantes) implements Response {
}
