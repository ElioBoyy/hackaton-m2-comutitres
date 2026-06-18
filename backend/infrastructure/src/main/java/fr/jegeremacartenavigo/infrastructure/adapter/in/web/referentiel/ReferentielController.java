package fr.jegeremacartenavigo.infrastructure.adapter.in.web.referentiel;

import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.referentiel.GetTypesAbonnementsQuery;
import fr.jegeremacartenavigo.application.referentiel.TypeAbonnementResponse;
import fr.jegeremacartenavigo.application.referentiel.TypeAbonnementsListResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/referentiel")
public class ReferentielController {

    private final QueryBus queryBus;

    public ReferentielController(QueryBus queryBus) {
        this.queryBus = queryBus;
    }

    @GetMapping("/abonnements")
    public List<TypeAbonnementResponse> abonnements() {
        TypeAbonnementsListResponse response = queryBus.ask(new GetTypesAbonnementsQuery());
        return response.abonnements();
    }
}
