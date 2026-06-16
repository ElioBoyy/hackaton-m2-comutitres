package fr.jegeremacartenavigo.domain.rag.port;

import fr.jegeremacartenavigo.domain.rag.model.TourConversation;

import java.util.List;
import java.util.function.Consumer;

/**
 * Port de generation de texte par un LLM. Implemente en infrastructure par un
 * adapter vers un fournisseur externe (Mistral).
 */
public interface ModeleConversationnel {

    /**
     * Genere une reponse complete (bloquant) a partir d'une instruction systeme
     * et d'une conversation.
     *
     * @param instructionSysteme consignes (role, ton, regle de citation/refus)
     * @param conversation       tours precedents + dernier message utilisateur,
     *                           dans l'ordre chronologique
     * @return le texte genere par le modele
     */
    String repondre(String instructionSysteme, List<TourConversation> conversation);

    /**
     * Genere une reponse en streaming : invoque {@code surMorceau} au fur et a
     * mesure que les morceaux de texte arrivent, sans attendre la fin.
     *
     * @param instructionSysteme consignes
     * @param conversation       conversation (idem {@link #repondre})
     * @param surMorceau         recoit chaque morceau de texte des sa reception
     */
    void diffuser(String instructionSysteme, List<TourConversation> conversation,
                  Consumer<String> surMorceau);
}
