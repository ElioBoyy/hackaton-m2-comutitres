package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Command;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * Commande backoffice : activation effective d'un dossier VALIDE en abonnement
 * ACTIF. L'agent choisit la {@code dateDebutDroits} ; le backend calcule
 * {@code dateFinDroits} selon la periodicite du type d'abonnement (annuel = +1 an,
 * mensuel = +1 mois, etc.).
 */
public record ActiverDossierCommand(
        @NotNull Integer idDossier,
        @NotNull Integer idAgent,
        @NotNull LocalDate dateDebutDroits
) implements Command<DossierDetailResponse> {
}
