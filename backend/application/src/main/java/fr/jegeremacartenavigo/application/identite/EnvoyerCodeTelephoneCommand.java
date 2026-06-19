package fr.jegeremacartenavigo.application.identite;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotNull;

/**
 * Demande l'envoi d'un code OTP par SMS sur le telephone de l'utilisateur.
 * L'{@code utilisateurId} est renseigne par le controller a partir du JWT, pas
 * par le client.
 */
public record EnvoyerCodeTelephoneCommand(
        @NotNull Integer utilisateurId
) implements Command<EnvoiCodeResponse> {
}
