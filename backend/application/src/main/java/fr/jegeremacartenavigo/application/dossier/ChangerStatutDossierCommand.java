package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import fr.jegeremacartenavigo.domain.dossier.model.CodeStatutDossier;
import jakarta.validation.constraints.NotNull;

/**
 * Commande backoffice pour valider/rejeter un dossier dans son ensemble.
 * Trigger par les boutons "Valider le dossier" / "Rejeter le dossier" sur
 * la page detail. {@code codeStatut} est typé avec l'enum domaine pour
 * eviter les coquilles silencieuses (Jackson convertit la string JSON au
 * niveau du body Spring).
 */
public record ChangerStatutDossierCommand(
        @NotNull Integer idDossier,
        @NotNull Integer idAgent,
        @NotNull CodeStatutDossier codeStatut
) implements Command<DossierDetailResponse> {
}
