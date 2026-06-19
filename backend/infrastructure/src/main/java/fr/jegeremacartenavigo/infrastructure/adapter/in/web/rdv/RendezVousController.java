package fr.jegeremacartenavigo.infrastructure.adapter.in.web.rdv;

import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import fr.jegeremacartenavigo.domain.dossier.port.NotificateurDossier;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

/**
 * Endpoint de confirmation de RDV en point de vente. La prise de RDV elle-meme
 * reste mockee cote frontend (pas d'API IDFM correspondante en demo). Cet
 * endpoint sert juste a envoyer l'email de confirmation au porteur connecte
 * une fois qu'il a choisi un creneau.
 */
@RestController
@RequestMapping("/rendez-vous")
public class RendezVousController {

    private final UtilisateurAuthRepository utilisateurRepository;
    private final NotificateurDossier notificateur;

    public RendezVousController(UtilisateurAuthRepository utilisateurRepository,
                                 NotificateurDossier notificateur) {
        this.utilisateurRepository = utilisateurRepository;
        this.notificateur = notificateur;
    }

    @PostMapping("/confirmation")
    public ResponseEntity<Void> confirmer(@AuthenticationPrincipal Jwt jwt,
                                           @RequestBody @Valid ConfirmerRdvRequest body) {
        Integer idUtilisateur = Integer.valueOf(jwt.getSubject());
        UtilisateurAuth u = utilisateurRepository.findById(idUtilisateur)
                .orElseThrow(UtilisateurIntrouvableException::new);
        notificateur.notifierConfirmationRdv(
                u.email(),
                u.prenom(),
                body.nomPointDeVente(),
                body.adressePointDeVente(),
                body.creneau()
        );
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    public record ConfirmerRdvRequest(
            @NotBlank String nomPointDeVente,
            @NotBlank String adressePointDeVente,
            @NotNull LocalDateTime creneau
    ) {}
}
