package fr.jegeremacartenavigo.domain.dossier.exception;

/**
 * Levee quand on tente de soumettre un dossier EN_ATTENTE_PAIEMENT sans qu'un
 * Paiement n'ait ete enregistre. Le controller la mappe en HTTP 409 Conflict
 * (code PAIEMENT_REQUIS) pour permettre au front de rediriger vers le tunnel
 * de paiement.
 */
public final class PaiementRequisException extends RuntimeException {
    private final Integer idDossier;

    public PaiementRequisException(Integer idDossier) {
        super("Paiement requis avant soumission du dossier " + idDossier);
        this.idDossier = idDossier;
    }

    public Integer idDossier() {
        return idDossier;
    }
}
