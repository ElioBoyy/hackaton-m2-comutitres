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
        /** Nom complet du beneficiaire quand la demande est pour un TIERS.
         *  Null si demandePour=MOI (le titulaire est alors l'utilisateur connecte). */
        String beneficiaireNomComplet,
        /** True si le demandeur s'est declare boursier au wizard.
         *  Sert au front a decider d'exposer la pièce "Notification de bourse"
         *  uniquement quand elle peut etre utile. */
        boolean boursier,
        List<PieceJustificativeResume> pieces,
        List<PieceRequiseResume> piecesRequises
) {
}
