package fr.jegeremacartenavigo.application.identite;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Verifie le code OTP saisi par l'utilisateur. L'{@code utilisateurId} vient du
 * JWT (renseigne par le controller), {@code code} du corps de la requete.
 */
public record VerifierCodeTelephoneCommand(
        @NotNull Integer utilisateurId,
        @NotBlank @Pattern(regexp = "\\d{4,8}") String code
) implements Command<VerificationResponse> {
}
