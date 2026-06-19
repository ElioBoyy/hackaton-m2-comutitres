package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import java.time.LocalDate;

/**
 * Corps JSON de {@code POST /dossiers/{id}/activer}.
 *
 * @param dateDebutDroits date a partir de laquelle l'abonnement est valide ;
 *                        la date de fin est calculee automatiquement cote
 *                        backend selon la periodicite du type d'abonnement.
 */
public record ActiverRequest(LocalDate dateDebutDroits) {
}
