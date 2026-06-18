package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

public class PieceIntrouvableException extends DomainException {

    public PieceIntrouvableException(Integer id) {
        super("Pièce justificative introuvable : " + id);
    }
}
