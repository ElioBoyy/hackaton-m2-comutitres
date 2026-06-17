package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand une donnee de reference necessaire (type d'abonnement, statut
 * de dossier, type de piece) est introuvable en base. Ces referentiels ne
 * sont aujourd'hui peuples que par {@code DataSeeder} (profil "seed") - cf.
 * limite documentee dans CONTEXT.md. Mappee en 404 par le
 * {@code GlobalExceptionHandler}, distincte du 422 generique des autres
 * {@code DomainException}.
 */
public class ReferentielIntrouvableException extends DomainException {

    public ReferentielIntrouvableException(String message) {
        super(message);
    }
}
