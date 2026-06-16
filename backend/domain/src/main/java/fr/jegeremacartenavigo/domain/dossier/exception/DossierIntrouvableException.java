package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand {@code idDossierExistant} ne correspond a aucun dossier
 * appartenant a l'utilisateur connecte (id inexistant, ou dossier d'un
 * autre utilisateur - jamais distingue explicitement pour ne pas reveler
 * l'existence du dossier a quelqu'un d'autre).
 */
public class DossierIntrouvableException extends DomainException {

    public DossierIntrouvableException() {
        super("Dossier introuvable.");
    }
}
