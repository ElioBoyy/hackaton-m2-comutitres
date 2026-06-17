package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

public class DossierIntrouvableException extends DomainException {

    public DossierIntrouvableException(Integer id) {
        super("Dossier introuvable : " + id);
    }
}
