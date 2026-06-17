package fr.jegeremacartenavigo.domain.rag.model;

/**
 * Un tour de parole dans une conversation (pour le contexte multi-tours).
 *
 * @param role    auteur du tour (utilisateur ou assistant)
 * @param contenu texte du tour
 */
public record TourConversation(Role role, String contenu) {

    public enum Role {
        utilisateur, assistant
    }

    public static TourConversation utilisateur(String contenu) {
        return new TourConversation(Role.utilisateur, contenu);
    }

    public static TourConversation assistant(String contenu) {
        return new TourConversation(Role.assistant, contenu);
    }
}
