package fr.jegeremacartenavigo.domain.rag.model;

/**
 * Resultat d'une demande d'escalade vers un agent humain.
 *
 * @param ticketCree       vrai si un ticket SAV a pu etre cree
 * @param referenceTicket  reference du ticket cree (null si {@code ticketCree} est faux)
 */
public record ResultatEscalade(boolean ticketCree, String referenceTicket) {

    public static ResultatEscalade avecTicket(String reference) {
        return new ResultatEscalade(true, reference);
    }

    public static ResultatEscalade sansTicket() {
        return new ResultatEscalade(false, null);
    }
}
