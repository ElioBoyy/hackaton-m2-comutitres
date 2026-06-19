package fr.jegeremacartenavigo.application.identite;

import fr.jegeremacartenavigo.application.cqrs.Response;

/**
 * @param telephoneMasque numero partiellement masque, pour affichage
 * @param dejaVerifie     vrai si le telephone etait deja verifie (aucun SMS envoye)
 */
public record EnvoiCodeResponse(String telephoneMasque, boolean dejaVerifie) implements Response {
}
