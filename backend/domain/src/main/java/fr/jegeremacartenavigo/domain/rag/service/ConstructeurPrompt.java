package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Citation;
import fr.jegeremacartenavigo.domain.rag.model.Passage;
import fr.jegeremacartenavigo.domain.rag.model.TourConversation;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Construit les prompts de l'assistant RAG et extrait les citations de la
 * reponse. Pur Java : la chaine produite est deterministe pour un meme contexte.
 *
 * <p>Regle imposee au modele : repondre <b>uniquement</b> a partir du contexte
 * fourni, citer ses sources par [n], et dire qu'il ne sait pas si l'information
 * n'y figure pas. C'est la moitie "prompt" du garde-fou anti-hallucination
 * (l'autre moitie etant {@link PolitiqueAncrage}).
 */
public final class ConstructeurPrompt {

    private static final Pattern REFERENCE = Pattern.compile("\\[(\\d{1,3})\\]");

    /** Refus quand la question est dans le perimetre mais non couverte par le corpus. */
    public static final String MESSAGE_REFUS =
            "Je ne dispose pas de cette information dans la base documentaire Navigo "
                    + "fournie. Je prefere ne pas repondre plutot que de risquer une "
                    + "information inexacte. Vous pouvez reformuler, ou demander a etre "
                    + "mis en relation avec un conseiller.";

    /** Refus quand la question est hors du perimetre Navigo (hors sujet). */
    public static final String MESSAGE_HORS_SUJET =
            "Je suis l'assistant de souscription Navigo (Ile-de-France Mobilites) et "
                    + "je ne traite que les questions liees aux titres de transport et a "
                    + "leur souscription. Votre question semble sortir de ce perimetre. "
                    + "Reformulez sur le sujet Navigo, ou demandez un conseiller.";

    public String instructionSysteme() {
        return """
                Tu es l'assistant de souscription Navigo (Ile-de-France Mobilites).
                Tu reponds en francais, de maniere claire, neutre et concise.

                REGLES IMPERATIVES :
                - Reponds UNIQUEMENT a partir des passages numerotes du CONTEXTE ci-dessous.
                - N'invente jamais. Si l'information n'est pas dans le contexte, reponds
                  exactement : "Je ne dispose pas de cette information dans la base
                  documentaire fournie." et rien d'autre.
                - Cite tes sources en fin de phrase avec leur numero entre crochets, ex: [1], [2].
                - Ne donne pas de conseil hors du perimetre Navigo / titres de transport IDFM.
                - Si plusieurs passages se contredisent (ex: tarifs de millesimes differents),
                  signale-le et privilegie la source la plus recente.
                """;
    }

    /** Instruction systeme du classifieur de continuite (sortie OUI/NON stricte). */
    public String instructionContinuite() {
        return """
                Tu es un classifieur. On te donne le fil d'une conversation puis un
                NOUVEAU MESSAGE de l'utilisateur. Determine si ce nouveau message
                POURSUIT la conversation (meme sujet, suite logique, reference implicite
                comme "et le prix ?", "et pour ca ?") ou s'il CHANGE clairement de sujet.
                Reponds par un seul mot, sans ponctuation : OUI s'il poursuit, NON s'il
                change de sujet.
                """;
    }

    /** Message du classifieur : historique compact + nouveau message. */
    public String messageContinuite(List<TourConversation> historique, String nouveauMessage) {
        StringBuilder sb = new StringBuilder("CONVERSATION :\n");
        int debut = Math.max(0, historique.size() - 6); // ~3 derniers echanges
        for (int i = debut; i < historique.size(); i++) {
            TourConversation tour = historique.get(i);
            String role = tour.role() == TourConversation.Role.assistant ? "assistant" : "utilisateur";
            sb.append(role).append(" : ").append(abreger(tour.contenu())).append('\n');
        }
        sb.append("\nNOUVEAU MESSAGE : ").append(nouveauMessage.strip()).append('\n');
        sb.append("Poursuit-il la conversation ? Reponds OUI ou NON.");
        return sb.toString();
    }

    private static String abreger(String texte) {
        String t = texte.strip();
        return t.length() <= 200 ? t : t.substring(0, 200) + "…";
    }

    /**
     * Construit le message utilisateur final : le contexte numerote suivi de la
     * question. Les numeros correspondent a l'ordre de {@code passages} (1-based).
     */
    public String messageAvecContexte(String question, List<Passage> passages) {
        StringBuilder sb = new StringBuilder();
        sb.append("CONTEXTE (passages issus de la documentation Navigo) :\n\n");
        for (int i = 0; i < passages.size(); i++) {
            Passage p = passages.get(i);
            sb.append('[').append(i + 1).append("] ");
            sb.append(p.titre() == null ? p.cheminSource() : p.titre());
            if (p.titreSection() != null) {
                sb.append(" — ").append(p.titreSection());
            }
            sb.append('\n').append(p.contenu().strip()).append("\n\n");
        }
        sb.append("QUESTION : ").append(question.strip()).append('\n');
        return sb.toString();
    }

    /**
     * Extrait les citations effectivement utilisees dans la reponse (references
     * [n] valides). Si le modele n'a cite aucune source, on retombe sur tous les
     * passages fournis (dedupliques par document) afin que l'API expose toujours
     * la provenance.
     */
    public List<Citation> citationsUtilisees(String reponse, List<Passage> passages) {
        List<Integer> reference = new ArrayList<>();
        if (reponse != null) {
            Matcher m = REFERENCE.matcher(reponse);
            while (m.find()) {
                int idx = Integer.parseInt(m.group(1));
                if (idx >= 1 && idx <= passages.size() && !reference.contains(idx)) {
                    reference.add(idx);
                }
            }
        }

        List<Passage> retenus = new ArrayList<>();
        if (reference.isEmpty()) {
            retenus.addAll(passages);
        } else {
            for (int idx : reference) {
                retenus.add(passages.get(idx - 1));
            }
        }
        return dedupliquer(retenus);
    }

    private static List<Citation> dedupliquer(List<Passage> passages) {
        Map<String, Citation> parDocument = new LinkedHashMap<>();
        int index = 1;
        for (Passage p : passages) {
            if (!parDocument.containsKey(p.cheminSource())) {
                parDocument.put(p.cheminSource(),
                        new Citation(index++, p.titre(), p.url(), p.cheminSource()));
            }
        }
        return List.copyOf(parDocument.values());
    }
}
