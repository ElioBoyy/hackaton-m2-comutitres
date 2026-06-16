package fr.jegeremacartenavigo.domain.dossier.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Resultat de la creation d'un Dossier : ce que
 * {@link fr.jegeremacartenavigo.domain.dossier.port.DossierRepository} renvoie
 * une fois le dossier, ses pieces et son paiement (mock) persistes.
 */
public record DossierCree(
        Integer idDossier,
        String codeStatut,
        BigDecimal montantTotal,
        ModePaiementDossier modePaiement,
        LocalDateTime dateCreation
) {
}
