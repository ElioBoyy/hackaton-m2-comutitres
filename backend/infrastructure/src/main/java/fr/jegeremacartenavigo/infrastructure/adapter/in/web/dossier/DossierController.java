package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.dossier.DossierDetailResponse;
import fr.jegeremacartenavigo.application.dossier.DossierListResponse;
import fr.jegeremacartenavigo.application.dossier.GetDossierDetailQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossiersQuery;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Routes backoffice : liste des dossiers en attente de verification et detail
 * d'un dossier. Reservees aux agents (cf. SecurityConfig : /dossiers/** exige
 * l'authority ROLE_AGENT).
 */
@RestController
@RequestMapping("/dossiers")
public class DossierController {

    private final QueryBus queryBus;

    public DossierController(QueryBus queryBus) {
        this.queryBus = queryBus;
    }

    @GetMapping
    public DossierListResponse list(
            @RequestParam(required = false) String statut,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return queryBus.ask(new GetDossiersQuery(statut, page, pageSize));
    }

    @GetMapping("/{id}")
    public DossierDetailResponse detail(@PathVariable Integer id) {
        return queryBus.ask(new GetDossierDetailQuery(id));
    }
}
