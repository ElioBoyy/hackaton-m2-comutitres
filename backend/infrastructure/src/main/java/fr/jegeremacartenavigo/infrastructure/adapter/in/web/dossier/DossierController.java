package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.dossier.CreerDossierCommand;
import fr.jegeremacartenavigo.application.dossier.DossierResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dossiers")
public class DossierController {

    private final CommandBus commandBus;

    public DossierController(CommandBus commandBus) {
        this.commandBus = commandBus;
    }

    @PostMapping
    public ResponseEntity<DossierResponse> creer(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestBody CreerDossierRequest body) {
        CreerDossierCommand command = new CreerDossierCommand(
                Integer.valueOf(jwt.getSubject()),
                body.idDossierExistant(),
                body.pourQui(),
                body.beneficiaireNomComplet(),
                body.situation(),
                body.situationPrecision(),
                body.boursier(),
                body.codeTypeAbonnement(),
                body.cheminPieceIdentite(),
                body.cheminCertificatScolarite(),
                body.cheminNotificationBourse(),
                body.modePaiement()
        );
        DossierResponse response = commandBus.send(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
