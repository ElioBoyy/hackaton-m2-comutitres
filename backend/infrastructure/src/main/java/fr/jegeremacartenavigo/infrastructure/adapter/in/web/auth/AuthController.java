package fr.jegeremacartenavigo.infrastructure.adapter.in.web.auth;

import fr.jegeremacartenavigo.application.auth.LoginCommand;
import fr.jegeremacartenavigo.application.auth.RegisterCommand;
import fr.jegeremacartenavigo.application.auth.TokenResponse;
import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.domain.auth.exception.AgentIntrouvableException;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.auth.model.AgentAuth;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.AgentAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.time.LocalDate;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final CommandBus commandBus;
    private final UtilisateurAuthRepository repository;
    private final AgentAuthRepository agentRepository;

    public AuthController(CommandBus commandBus,
                           UtilisateurAuthRepository repository,
                           AgentAuthRepository agentRepository) {
        this.commandBus = commandBus;
        this.repository = repository;
        this.agentRepository = agentRepository;
    }

    /** Route publique (cf. SecurityConfig) : @SecurityRequirements vide retire le cadenas dans Swagger UI. */
    @PostMapping("/register")
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(examples = @ExampleObject(value = """
                    {
                      "email": "lea.martin@example.com",
                      "password": "Password123!",
                      "nom": "Martin",
                      "prenom": "Lea",
                      "dateNaissance": "2003-04-12",
                      "telephone": "0612345678",
                      "numeroEtVoie": "10 rue de Rivoli",
                      "codePostal": "75004",
                      "ville": "Paris",
                      "departementCode": "75",
                      "departementLibelle": "Paris"
                    }
                    """))
    )
    public ResponseEntity<TokenResponse> register(@RequestBody @Valid RegisterCommand command) {
        TokenResponse token = commandBus.send(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    /** Route publique (cf. SecurityConfig) : @SecurityRequirements vide retire le cadenas dans Swagger UI. */
    @PostMapping("/login")
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            content = @Content(examples = @ExampleObject(value = """
                    {
                      "email": "lea.martin@example.com",
                      "password": "Password123!"
                    }
                    """))
    )
    public TokenResponse login(@RequestBody @Valid LoginCommand command) {
        return commandBus.send(command);
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        Integer id = Integer.valueOf(jwt.getSubject());
        UtilisateurAuth u = repository.findById(id).orElseThrow(UtilisateurIntrouvableException::new);
        return new MeResponse(u.id(), u.email(), u.nom(), u.prenom(), u.dateNaissance());
    }

    public record MeResponse(Integer id, String email, String nom, String prenom, LocalDate dateNaissance) {
    }

    @GetMapping("/agent/me")
    public AgentMeResponse agentMe(@AuthenticationPrincipal Jwt jwt) {
        Integer id = Integer.valueOf(jwt.getSubject());
        AgentAuth agent = agentRepository.findById(id).orElseThrow(AgentIntrouvableException::new);
        return new AgentMeResponse(agent.id(), agent.email(), agent.nom(), agent.prenom());
    }

    public record AgentMeResponse(Integer id, String email, String nom, String prenom) {
    }
}
