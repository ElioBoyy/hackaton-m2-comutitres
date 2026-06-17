package fr.jegeremacartenavigo.application.rag;

import fr.jegeremacartenavigo.domain.rag.model.AssistantReponse;
import fr.jegeremacartenavigo.domain.rag.model.Citation;
import fr.jegeremacartenavigo.domain.rag.model.Passage;
import fr.jegeremacartenavigo.domain.rag.model.TourConversation;
import fr.jegeremacartenavigo.domain.rag.port.EmbeddingPort;
import fr.jegeremacartenavigo.domain.rag.port.MagasinVecteurs;
import fr.jegeremacartenavigo.domain.rag.port.ModeleConversationnel;
import fr.jegeremacartenavigo.domain.rag.service.ConstructeurPrompt;
import fr.jegeremacartenavigo.domain.rag.service.FiltreHorsSujet;
import fr.jegeremacartenavigo.domain.rag.service.PolitiqueAncrage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.function.Consumer;

/**
 * Moteur de reponse RAG, partage par l'assistant "one-shot" et le chat (bloquant
 * ou streaming). Deux garde-fous explicites s'enchainent avant toute generation :
 *
 * <ol>
 *   <li><b>anti-hors-sujet</b> ({@link FiltreHorsSujet}) : si la question sort du
 *       perimetre Navigo (meilleur passage trop eloigne), refus immediat ;</li>
 *   <li><b>anti-hallucination</b> ({@link PolitiqueAncrage}) : sinon, il faut
 *       assez de passages fiables pour fonder une reponse, faute de quoi refus.</li>
 * </ol>
 *
 * Un 3e garde-fou agit apres generation : si le modele declare lui-meme ne pas
 * savoir, on traite la reponse comme un refus (et on ne cite rien).
 */
public final class MoteurRag {

    private static final Logger log = LoggerFactory.getLogger(MoteurRag.class);

    private final EmbeddingPort embedding;
    private final MagasinVecteurs magasin;
    private final FiltreHorsSujet filtreHorsSujet;
    private final PolitiqueAncrage politique;
    private final ConstructeurPrompt prompt;
    private final ModeleConversationnel modele;
    private final int topK;

    public MoteurRag(EmbeddingPort embedding, MagasinVecteurs magasin, FiltreHorsSujet filtreHorsSujet,
                     PolitiqueAncrage politique, ConstructeurPrompt prompt,
                     ModeleConversationnel modele, int topK) {
        this.embedding = embedding;
        this.magasin = magasin;
        this.filtreHorsSujet = filtreHorsSujet;
        this.politique = politique;
        this.prompt = prompt;
        this.modele = modele;
        this.topK = topK;
    }

    private enum Decision { HORS_SUJET, NON_ANCRE, REPONDRE }

    private record Evaluation(Decision decision, List<Passage> pertinents) {
    }

    /** Reponse complete (bloquante). Utilisee par l'assistant one-shot et le chat non-streame. */
    public AssistantReponse repondre(String question, List<TourConversation> historique) {
        Recherche recherche = rechercher(question);
        AssistantReponse refus = refusEventuel(recherche.evaluation());
        if (refus != null) {
            return refus;
        }
        String texte = modele.repondre(
                prompt.instructionSysteme(),
                conversationAvecContexte(question, historique, recherche.evaluation().pertinents()));
        return finaliser(texte, recherche.evaluation().pertinents());
    }

    /**
     * Reponse en streaming : les morceaux de texte sont pousses dans
     * {@code surMorceau} des leur arrivee. Le message de refus est aussi streame
     * (le client voit toujours quelque chose). Renvoie la reponse finale assemblee
     * (texte complet + citations + statut hors-corpus) pour la persistance.
     */
    public AssistantReponse repondreEnStream(String question, List<TourConversation> historique,
                                             Consumer<String> surMorceau) {
        Recherche recherche = rechercher(question);
        AssistantReponse refus = refusEventuel(recherche.evaluation());
        if (refus != null) {
            surMorceau.accept(refus.texte());
            return refus;
        }

        StringBuilder accumulateur = new StringBuilder();
        modele.diffuser(
                prompt.instructionSysteme(),
                conversationAvecContexte(question, historique, recherche.evaluation().pertinents()),
                morceau -> {
                    accumulateur.append(morceau);
                    surMorceau.accept(morceau);
                });
        return finaliser(accumulateur.toString(), recherche.evaluation().pertinents());
    }

    private record Recherche(List<Passage> candidats, Evaluation evaluation) {
    }

    private Recherche rechercher(String question) {
        float[] vecteur = embedding.vectoriserRequete(question);
        List<Passage> candidats = magasin.rechercher(vecteur, topK);
        return new Recherche(candidats, evaluer(candidats));
    }

    /** Enchaine les deux garde-fous d'entree (hors-sujet puis ancrage). */
    private Evaluation evaluer(List<Passage> candidats) {
        if (filtreHorsSujet.horsSujet(candidats)) {
            return new Evaluation(Decision.HORS_SUJET, List.of());
        }
        List<Passage> pertinents = politique.pertinents(candidats);
        if (!politique.estAncre(candidats)) {
            return new Evaluation(Decision.NON_ANCRE, pertinents);
        }
        return new Evaluation(Decision.REPONDRE, pertinents);
    }

    private AssistantReponse refusEventuel(Evaluation evaluation) {
        return switch (evaluation.decision()) {
            case HORS_SUJET -> {
                log.debug("Refus : question hors perimetre Navigo");
                yield AssistantReponse.refus(ConstructeurPrompt.MESSAGE_HORS_SUJET, "hors sujet");
            }
            case NON_ANCRE -> {
                log.debug("Refus : aucun passage assez fiable pour fonder une reponse");
                yield AssistantReponse.refus(ConstructeurPrompt.MESSAGE_REFUS,
                        "aucun passage au-dessus du seuil de similarite");
            }
            case REPONDRE -> null;
        };
    }

    private List<TourConversation> conversationAvecContexte(String question,
                                                            List<TourConversation> historique,
                                                            List<Passage> pertinents) {
        List<TourConversation> conversation = new ArrayList<>(
                historique == null ? List.of() : historique);
        conversation.add(TourConversation.utilisateur(prompt.messageAvecContexte(question, pertinents)));
        return conversation;
    }

    /** 3e garde-fou : si le modele dit ne pas savoir, on refuse (sans citations). */
    private AssistantReponse finaliser(String texte, List<Passage> pertinents) {
        if (modeleADeclareNePasSavoir(texte)) {
            log.debug("Le modele a declare ne pas savoir malgre des passages pertinents");
            return AssistantReponse.refus(texte.strip(),
                    "le modele n'a pas trouve la reponse dans le contexte fourni");
        }
        List<Citation> citations = prompt.citationsUtilisees(texte, pertinents);
        return AssistantReponse.ancree(texte.strip(), citations, pertinents);
    }

    private static boolean modeleADeclareNePasSavoir(String texte) {
        if (texte == null || texte.isBlank()) {
            return true;
        }
        return texte.toLowerCase(Locale.FRENCH).contains("je ne dispose pas de cette information");
    }

    /**
     * Pipeline de continuite : determine si {@code message} poursuit la
     * conversation (meme sujet) ou en change. Repli sur {@code true} (on garde la
     * session) si l'historique est vide ou si le classifieur echoue, pour ne
     * jamais casser une conversation par erreur.
     */
    public boolean memeSujet(List<TourConversation> historique, String message) {
        if (historique == null || historique.isEmpty()) {
            return true;
        }
        try {
            String verdict = modele.repondre(
                    prompt.instructionContinuite(),
                    List.of(TourConversation.utilisateur(prompt.messageContinuite(historique, message))));
            boolean meme = interpreterVerdict(verdict);
            log.debug("Continuite : verdict='{}' -> memeSujet={}",
                    verdict == null ? "" : verdict.strip(), meme);
            return meme;
        } catch (RuntimeException e) {
            log.warn("Detection de continuite indisponible ({}) : on conserve la session", e.getMessage());
            return true;
        }
    }

    /** OUI -> meme sujet (true) ; NON -> changement (false) ; ambigu -> on garde la session. */
    private static boolean interpreterVerdict(String verdict) {
        if (verdict == null) {
            return true;
        }
        String n = verdict.strip().toUpperCase(Locale.FRENCH);
        if (n.startsWith("NON")) {
            return false;
        }
        if (n.startsWith("OUI")) {
            return true;
        }
        return !n.contains("NON");
    }
}
