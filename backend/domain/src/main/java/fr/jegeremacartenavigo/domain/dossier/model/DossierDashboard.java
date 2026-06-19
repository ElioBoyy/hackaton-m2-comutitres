package fr.jegeremacartenavigo.domain.dossier.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Vue domaine d'un dossier pour le tableau de bord utilisateur.
 *
 * <p>{@code porteurIdentite} et {@code payeurIdentite} sont toujours renseignes ;
 * le front peut les comparer a l'utilisateur connecte pour determiner son role.
 *
 * <p>{@code dateRenouvellement} = {@code dateFinDroits} - 30 jours ; null si
 * {@code dateFinDroits} est null.
 *
 * <p>{@code piecesADeposer} est vrai uniquement si le statut est PIECES_MANQUANTES.
 */
public record DossierDashboard(
        Integer idDossier,
        String numeroDossier,
        RoleDossier role,
        UtilisateurIdentite porteurIdentite,
        UtilisateurIdentite payeurIdentite,
        String typeAbonnementLibelle,
        List<TransportMode> transports,
        List<ZoneNavigo> zones,
        StatutDossierResume statut,
        LocalDateTime dateCreation,
        LocalDate dateDebutDroits,
        LocalDate dateFinDroits,
        LocalDate dateRenouvellement,
        BigDecimal montantTotal,
        boolean piecesADeposer,
        /** Nom complet du beneficiaire quand demandePour=TIERS. Null pour MOI. */
        String beneficiaireNomComplet
) {
}
