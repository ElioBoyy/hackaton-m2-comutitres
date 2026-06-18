package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DossierDetailResponse(
        Integer idDossier,
        String numeroDossier,
        PersonneResponse titulaire,
        PersonneResponse payeur,
        TypeAbonnementResponse typeAbonnement,
        StatutDossierResponse statut,
        LocalDateTime dateCreation,
        LocalDate dateDebutDroits,
        LocalDate dateFinDroits,
        BigDecimal montantTotal,
        List<PieceJustificativeResponse> pieces,
        List<PieceRequiseResponse> piecesRequises
) implements Response {

    public static DossierDetailResponse from(DossierDetail d) {
        return new DossierDetailResponse(
                d.id(),
                d.numeroDossier(),
                PersonneResponse.from(d.titulaire()),
                PersonneResponse.from(d.payeur()),
                new TypeAbonnementResponse(d.codeTypeAbonnement(), d.libelleTypeAbonnement()),
                new StatutDossierResponse(d.codeStatut(), d.libelleStatut(), d.categorieStatut()),
                d.dateCreation(),
                d.dateDebutDroits(),
                d.dateFinDroits(),
                d.montantTotal(),
                d.pieces().stream().map(PieceJustificativeResponse::from).toList(),
                d.piecesRequises().stream().map(PieceRequiseResponse::from).toList()
        );
    }
}
