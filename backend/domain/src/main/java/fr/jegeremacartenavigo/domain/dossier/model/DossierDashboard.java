package fr.jegeremacartenavigo.domain.dossier.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Vue domaine d'un dossier pour le tableau de bord utilisateur. {@code role}
 * indique si l'utilisateur connecte est porteur, payeur, ou les deux ; dans ce
 * dernier cas {@code autrePersonne} est {@code null} (il n'y a personne
 * d'"autre" a afficher).
 *
 * <p>{@code piecesADeposer} est un simple drapeau (vrai uniquement si le
 * statut est {@code PIECES_MANQUANTES}) : la liste exacte des pieces
 * manquantes est hors perimetre de ce cas d'usage.
 */
public record DossierDashboard(
        Integer idDossier,
        RoleDossier role,
        UtilisateurIdentite autrePersonne,
        String typeAbonnementLibelle,
        StatutDossierResume statut,
        LocalDateTime dateCreation,
        LocalDate dateDebutDroits,
        LocalDate dateFinDroits,
        BigDecimal montantTotal,
        boolean piecesADeposer
) {
}
