package fr.jegeremacartenavigo.domain.dossier.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue domaine complete d'un dossier, utilisee par un agent backoffice pour
 * verifier les pieces et statuer sur le dossier.
 */
public record DossierDetail(
        Integer id,
        String numeroDossier,
        Personne titulaire,
        Personne payeur,
        String codeTypeAbonnement,
        String libelleTypeAbonnement,
        String codeStatut,
        String libelleStatut,
        String categorieStatut,
        LocalDateTime dateCreation,
        LocalDate dateDebutDroits,
        LocalDate dateFinDroits,
        BigDecimal montantTotal,
        List<PieceJustificativeResume> pieces
) {
}
