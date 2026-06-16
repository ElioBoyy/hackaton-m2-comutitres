package fr.jegeremacartenavigo.infrastructure.adapter.in.web.auth;

import fr.jegeremacartenavigo.application.auth.LoginCommand;
import fr.jegeremacartenavigo.application.auth.RegisterCommand;
import fr.jegeremacartenavigo.application.auth.TokenResponse;
import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
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

    public AuthController(CommandBus commandBus, UtilisateurAuthRepository repository) {
        this.commandBus = commandBus;
        this.repository = repository;
    }

    @PostMapping("/register")
    public ResponseEntity<TokenResponse> register(@RequestBody @Valid RegisterCommand command) {
        TokenResponse token = commandBus.send(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(token);
    }

    @PostMapping("/login")
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
}
