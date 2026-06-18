package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;

import java.time.LocalDateTime;

public record DossierResumeResponse(
        Integer idDossier,
        String numeroDossier,
        String nomTitulaire,
        TypeAbonnementResponse typeAbonnement,
        StatutDossierResponse statut,
        long nbPiecesEnAttente,
        LocalDateTime dateCreation
) {
    public static DossierResumeResponse from(DossierResume d) {
        return new DossierResumeResponse(
                d.id(),
                d.numeroDossier(),
                d.nomTitulaire(),
                new TypeAbonnementResponse(d.codeTypeAbonnement(), d.libelleTypeAbonnement()),
                new StatutDossierResponse(d.codeStatut(), d.libelleStatut(), d.categorieStatut()),
                d.nbPiecesEnAttente(),
                d.dateCreation()
        );
    }
}
