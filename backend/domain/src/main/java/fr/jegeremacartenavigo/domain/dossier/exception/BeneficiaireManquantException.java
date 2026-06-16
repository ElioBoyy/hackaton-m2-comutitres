package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand {@code DemandePour.TIERS} est choisi sans nom de beneficiaire.
 */
public class BeneficiaireManquantException extends DomainException {

    public BeneficiaireManquantException() {
        super("Le nom du beneficiaire est requis pour une demande faite pour un tiers.");
    }
}
