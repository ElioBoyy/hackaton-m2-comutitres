package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand on tente de completer (idDossierExistant) un dossier qui n'est
 * plus a l'etat brouillon EN_ATTENTE_PAIEMENT (deja paye, rejete...). Un tel
 * dossier ne peut plus etre modifie via CreerDossier.
 */
public class DossierDejaFinaliseException extends DomainException {

    public DossierDejaFinaliseException() {
        super("Ce dossier a deja ete finalise et ne peut plus etre modifie.");
    }
}
