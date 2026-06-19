package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee a la creation d'un dossier quand un abonnement actif ou valide existe
 * deja pour la cible visee (le porteur connecte pour DemandePour.MOI, ou le
 * meme beneficiaire nomme pour DemandePour.TIERS). Empeche un user de cumuler
 * deux abonnements simultanes pour la meme personne — pour creer un nouvel
 * abonnement il faut attendre l'expiration ou la resiliation de l'actuel.
 *
 * <p>"Actif ou valide" = statut ACTIF ou VALIDE avec
 * {@code dateFinDroits IS NULL OR dateFinDroits >= aujourd'hui}.
 */
public class AbonnementActifExistantException extends DomainException {

    public AbonnementActifExistantException(String beneficiaireNomComplet) {
        super(beneficiaireNomComplet == null
                ? "Vous avez deja un abonnement actif. Attendez son expiration ou resiliez-le avant d'en creer un nouveau."
                : "Un abonnement actif existe deja pour " + beneficiaireNomComplet
                        + ". Attendez son expiration ou resiliez-le avant d'en creer un nouveau.");
    }
}
