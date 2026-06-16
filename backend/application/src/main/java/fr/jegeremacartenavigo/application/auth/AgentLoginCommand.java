package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AgentLoginCommand(
        @Email @NotBlank String email,
        @NotBlank String password
) implements Command<TokenResponse> {
}
