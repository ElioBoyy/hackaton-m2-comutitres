package fr.jegeremacartenavigo.infrastructure.adapter.in.web.sav;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.sav.AssignerReclamationCommand;
import fr.jegeremacartenavigo.application.sav.ChangerStatutReclamationCommand;
import fr.jegeremacartenavigo.application.sav.CreerReclamationCommand;
import fr.jegeremacartenavigo.application.sav.GetMesReclamationsQuery;
import fr.jegeremacartenavigo.application.sav.GetReclamationCountsQuery;
import fr.jegeremacartenavigo.application.sav.GetReclamationDetailQuery;
import fr.jegeremacartenavigo.application.sav.GetReclamationsQuery;
import fr.jegeremacartenavigo.application.sav.ReclamationCountsResponse;
import fr.jegeremacartenavigo.application.sav.ReclamationDetailResponse;
import fr.jegeremacartenavigo.application.sav.ReclamationListResponse;
import fr.jegeremacartenavigo.application.sav.RepondreReclamationCommand;
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

/**
 * API des reclamations (tickets SAV). Endpoints client (suivi + ouverture +
 * messages) et endpoints backoffice (file, detail, statut, assignation). Le
 * role est deduit du claim {@code type} du JWT ; les routes reservees aux
 * agents sont aussi verrouillees par la chaine Security (matchers /reclamations).
 */
@RestController
@RequestMapping("/reclamations")
public class ReclamationController {

    private final QueryBus queryBus;
    private final CommandBus commandBus;

    public ReclamationController(QueryBus queryBus, CommandBus commandBus) {
        this.queryBus = queryBus;
        this.commandBus = commandBus;
    }

    // ─── Client ───────────────────────────────────────────────────────────────

    @GetMapping("/mes")
    public ReclamationListResponse mesReclamations(@AuthenticationPrincipal Jwt jwt) {
        return queryBus.ask(new GetMesReclamationsQuery(idAuteur(jwt)));
    }

    @PostMapping
    public ResponseEntity<ReclamationDetailResponse> creer(@AuthenticationPrincipal Jwt jwt,
                                                           @RequestBody CreerReclamationRequest body) {
        ReclamationDetailResponse response = commandBus.send(new CreerReclamationCommand(
                idAuteur(jwt), body.codeCategorie(), body.objet(), body.description()));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    public ReclamationDetailResponse detail(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        // Agent : acces complet. Client : restreint au proprietaire (ownership).
        Integer proprietaire = estAgent(jwt) ? null : idAuteur(jwt);
        return queryBus.ask(new GetReclamationDetailQuery(id, proprietaire));
    }

    @PostMapping("/{id}/messages")
    public ReclamationDetailResponse repondre(@PathVariable Integer id,
                                              @AuthenticationPrincipal Jwt jwt,
                                              @RequestBody RepondreReclamationRequest body) {
        boolean parAgent = estAgent(jwt);
        // Cote client, on verifie l'ownership avant d'autoriser la reponse
        // (le client ne doit pas pouvoir poster sur le ticket d'autrui).
        if (!parAgent) {
            queryBus.ask(new GetReclamationDetailQuery(id, idAuteur(jwt)));
        }
        return commandBus.send(new RepondreReclamationCommand(id, body.contenu(), idAuteur(jwt), parAgent));
    }

    // ─── Backoffice (agents) ────────────────────────────────────────────────

    @GetMapping
    public ReclamationListResponse list(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String nomClient,
            @RequestParam(required = false) String reference,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return queryBus.ask(new GetReclamationsQuery(statut, nomClient, reference, page, pageSize));
    }

    @GetMapping("/counts")
    public ReclamationCountsResponse counts(
            @RequestParam(required = false) String nomClient,
            @RequestParam(required = false) String reference) {
        return queryBus.ask(new GetReclamationCountsQuery(nomClient, reference));
    }

    @PatchMapping("/{id}/statut")
    public ReclamationDetailResponse changerStatut(@PathVariable Integer id,
                                                   @AuthenticationPrincipal Jwt jwt,
                                                   @RequestBody ChangerStatutReclamationRequest body) {
        return commandBus.send(new ChangerStatutReclamationCommand(id, body.statut(), idAuteur(jwt)));
    }

    @PostMapping("/{id}/assigner")
    public ReclamationDetailResponse assigner(@PathVariable Integer id, @AuthenticationPrincipal Jwt jwt) {
        return commandBus.send(new AssignerReclamationCommand(id, idAuteur(jwt)));
    }

    private static Integer idAuteur(Jwt jwt) {
        return Integer.valueOf(jwt.getSubject());
    }

    private static boolean estAgent(Jwt jwt) {
        return "agent".equals(jwt.getClaimAsString("type"));
    }
}
