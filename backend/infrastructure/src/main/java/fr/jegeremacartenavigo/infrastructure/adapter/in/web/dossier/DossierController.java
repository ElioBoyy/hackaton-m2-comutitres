package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.dossier.ChangerStatutDossierCommand;
import fr.jegeremacartenavigo.application.dossier.CreerDossierCommand;
import fr.jegeremacartenavigo.application.dossier.DossierCountsResponse;
import fr.jegeremacartenavigo.application.dossier.DossierDetailResponse;
import fr.jegeremacartenavigo.application.dossier.DossierListResponse;
import fr.jegeremacartenavigo.application.dossier.DossierResponse;
import fr.jegeremacartenavigo.application.dossier.GetDossierCountsQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossierDetailQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossierHistoriqueQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossiersQuery;
import fr.jegeremacartenavigo.application.dossier.HistoriqueEntreeResponse;
import fr.jegeremacartenavigo.application.dossier.PieceJustificativeResponse;
import fr.jegeremacartenavigo.application.dossier.ValiderPieceCommand;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dossiers")
public class DossierController {

    private final QueryBus queryBus;
    private final CommandBus commandBus;

    public DossierController(QueryBus queryBus, CommandBus commandBus) {
        this.queryBus = queryBus;
        this.commandBus = commandBus;
    }

    @GetMapping
    public DossierListResponse list(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String nomClient,
            @RequestParam(required = false) String numeroDossier,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return queryBus.ask(new GetDossiersQuery(statut, nomClient, numeroDossier, page, pageSize));
    }

    @GetMapping("/counts")
    public DossierCountsResponse counts(
            @RequestParam(required = false) String nomClient,
            @RequestParam(required = false) String numeroDossier) {
        return queryBus.ask(new GetDossierCountsQuery(nomClient, numeroDossier));
    }

    @GetMapping("/{id}")
    public DossierDetailResponse detail(@PathVariable Integer id) {
        return queryBus.ask(new GetDossierDetailQuery(id));
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
                body.modePaiement(),
                body.enAttentePaiement()
        );
        DossierResponse response = commandBus.send(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}/historique")
    public HistoriqueEntreeResponse.ListResponse historique(@PathVariable Integer id) {
        return queryBus.ask(new GetDossierHistoriqueQuery(id));
    }

    @PatchMapping("/{id}/pieces/{pieceId}")
    public PieceJustificativeResponse validerPiece(
            @PathVariable Integer id,
            @PathVariable Integer pieceId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ValiderPieceRequest body) {
        return commandBus.send(new ValiderPieceCommand(
                id, pieceId,
                Integer.valueOf(jwt.getSubject()),
                body.valider(),
                body.motifRejet()
        ));
    }

    /**
     * Change le statut du dossier (boutons "Valider/Rejeter le dossier" cote
     * backoffice). {@code codeStatut} doit etre un code du referentiel
     * (VALIDE / REJETE / INCOMPLET / ...). Reserve aux agents par la chaine
     * Security (matcher /dossiers/**).
     */
    @PatchMapping("/{id}/statut")
    public DossierDetailResponse changerStatut(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ChangerStatutRequest body) {
        return commandBus.send(new ChangerStatutDossierCommand(
                id,
                Integer.valueOf(jwt.getSubject()),
                body.codeStatut()
        ));
    }
}
