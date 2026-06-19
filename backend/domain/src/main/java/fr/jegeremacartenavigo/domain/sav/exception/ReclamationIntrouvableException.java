package fr.jegeremacartenavigo.domain.sav.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Reclamation absente ou non accessible par l'appelant (ownership). On ne
 * distingue pas les deux cas cote client pour ne pas divulguer l'existence d'un
 * ticket d'autrui.
 */
public class ReclamationIntrouvableException extends DomainException {

    public ReclamationIntrouvableException(Integer id) {
        super("Reclamation introuvable : " + id);
    }
}
