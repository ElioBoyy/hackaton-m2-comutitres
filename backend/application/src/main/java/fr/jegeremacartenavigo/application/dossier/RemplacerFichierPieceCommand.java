package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Commande backoffice : un agent remplace le fichier d'une piece existante.
 * Le statut de la piece est remis a {@code en_attente} et toute trace de
 * validation precedente (agent, motif rejet) est purgee : on traite la
 * piece comme un nouveau depot. Le fichier est suppose deja sur MinIO.
 */
/**
 * @param idAuteur id de l'agent ou de l'utilisateur qui declenche le remplacement
 * @param parAgent true = action backoffice (Agent), false = action client (porteur)
 */
public record RemplacerFichierPieceCommand(
        @NotNull Integer idDossier,
        @NotNull Integer idPiece,
        @NotNull Integer idAuteur,
        @NotBlank String cheminFichier,
        boolean parAgent
) implements Command<PieceJustificativeResponse> {
}
