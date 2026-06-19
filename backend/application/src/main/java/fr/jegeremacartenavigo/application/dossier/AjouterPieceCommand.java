package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Commande backoffice : un agent ajoute manuellement une piece sur un dossier
 * (cas du depot en agence, ou d'une piece manquante recuperee hors ligne).
 * Le fichier est suppose deja stocke sur MinIO sous {@code cheminFichier} ;
 * le controller s'occupe de l'upload avant d'emettre cette commande.
 */
/**
 * @param idAuteur id de l'agent ou de l'utilisateur (porteur du dossier) qui declenche l'action
 * @param parAgent true = action backoffice (Agent), false = action client (porteur)
 */
public record AjouterPieceCommand(
        @NotNull Integer idDossier,
        @NotNull Integer idAuteur,
        @NotBlank String codeTypePiece,
        @NotBlank String cheminFichier,
        boolean parAgent
) implements Command<PieceJustificativeResponse> {
}
