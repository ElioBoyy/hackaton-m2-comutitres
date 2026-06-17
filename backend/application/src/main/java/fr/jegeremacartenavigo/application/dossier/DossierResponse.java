package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.ModePaiementDossier;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DossierResponse(
        Integer idDossier,
        String codeStatut,
        BigDecimal montantTotal,
        ModePaiementDossier modePaiement,
        LocalDateTime dateCreation
) implements Response {

    public static DossierResponse from(DossierCree cree) {
        return new DossierResponse(
                cree.idDossier(),
                cree.codeStatut(),
                cree.montantTotal(),
                cree.modePaiement(),
                cree.dateCreation()
        );
    }
}
