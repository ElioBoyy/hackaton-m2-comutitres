package fr.jegeremacartenavigo.domain.sav.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Code de categorie SAV inconnu (table {@code categorie_sav} non seedee ou code
 * invalide envoye par le client).
 */
public class CategorieReclamationIntrouvableException extends DomainException {

    public CategorieReclamationIntrouvableException(String code) {
        super("Categorie de reclamation introuvable : " + code);
    }
}
