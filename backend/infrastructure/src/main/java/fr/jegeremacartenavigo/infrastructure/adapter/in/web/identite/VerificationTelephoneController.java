package fr.jegeremacartenavigo.infrastructure.adapter.in.web.identite;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.identite.EnvoiCodeResponse;
import fr.jegeremacartenavigo.application.identite.EnvoyerCodeTelephoneCommand;
import fr.jegeremacartenavigo.application.identite.VerificationResponse;
import fr.jegeremacartenavigo.application.identite.VerifierCodeTelephoneCommand;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Verification du telephone par OTP (Infobip 2FA), etape d'onboarding.
 * L'utilisateur est identifie par son JWT : le client n'envoie jamais d'id.
 */
@RestController
@RequestMapping("/auth/telephone")
public class VerificationTelephoneController {

    private final CommandBus commandBus;

    public VerificationTelephoneController(CommandBus commandBus) {
        this.commandBus = commandBus;
    }

    /** Envoie (ou renvoie) un code OTP par SMS sur le telephone du compte. */
    @PostMapping("/code")
    public EnvoiCodeResponse envoyerCode(@AuthenticationPrincipal Jwt jwt) {
        Integer utilisateurId = Integer.valueOf(jwt.getSubject());
        return commandBus.send(new EnvoyerCodeTelephoneCommand(utilisateurId));
    }

    /** Verifie le code saisi par l'utilisateur. */
    @PostMapping("/verifier")
    public VerificationResponse verifier(@AuthenticationPrincipal Jwt jwt,
                                         @RequestBody @Valid VerifierCodeRequete requete) {
        Integer utilisateurId = Integer.valueOf(jwt.getSubject());
        return commandBus.send(new VerifierCodeTelephoneCommand(utilisateurId, requete.code()));
    }

    public record VerifierCodeRequete(
            @NotBlank @Pattern(regexp = "\\d{4,8}") String code
    ) {}
}
