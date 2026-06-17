package fr.jegeremacartenavigo.application.auth;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterCommand(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 100) String nom,
        @NotBlank @Size(max = 100) String prenom,
        @Past LocalDate dateNaissance,
        @NotBlank @Size(max = 150) String numeroEtVoie,
        @NotBlank @Pattern(regexp = "\\d{5}") String codePostal,
        @NotBlank @Size(max = 100) String ville,
        @NotBlank @Size(min = 2, max = 3) String departementCode,
        @NotBlank @Size(max = 50) String departementLibelle
) implements Command<TokenResponse> {
}
