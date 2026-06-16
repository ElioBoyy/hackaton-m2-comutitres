package fr.jegeremacartenavigo.bootstrap.rag;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.rag.ingestion.IngererCorpusCommand;
import fr.jegeremacartenavigo.domain.rag.model.Passage;
import fr.jegeremacartenavigo.domain.rag.port.EmbeddingPort;
import fr.jegeremacartenavigo.domain.rag.port.MagasinVecteurs;
import fr.jegeremacartenavigo.domain.rag.service.PolitiqueAncrage;
import fr.jegeremacartenavigo.infrastructure.config.RagProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Evaluation "Golden Set" du RAG, active sur le profil {@code rag-eval}. Ingere
 * le corpus puis, pour un jeu de questions de reference, mesure :
 * <ul>
 *   <li><b>rappel@k</b> : la (les) source(s) attendue(s) figurent-elles dans les
 *       {@code topK} passages retrouves (pour les questions du corpus) ;</li>
 *   <li><b>justesse du garde-fou</b> : la decision repondre/refuser (ancrage)
 *       correspond-elle a ce qui est attendu (question dans le corpus ou non).</li>
 * </ul>
 * Necessite la cle Voyage (embeddings + recherche). N'appelle pas Mistral : la
 * generation est evaluable manuellement via l'endpoint /api/assistant/ask.
 *
 * <p>Lancement :
 * {@code ./mvnw -pl bootstrap spring-boot:run -Dspring-boot.run.profiles=rag-eval}
 */
@Component
@Profile("rag-eval")
public class RagEvalRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RagEvalRunner.class);

    private final CommandBus commandBus;
    private final EmbeddingPort embedding;
    private final MagasinVecteurs magasin;
    private final PolitiqueAncrage politique;
    private final ObjectMapper objectMapper;
    private final int topK;

    public RagEvalRunner(CommandBus commandBus, EmbeddingPort embedding, MagasinVecteurs magasin,
                         PolitiqueAncrage politique, ObjectMapper objectMapper, RagProperties properties) {
        this.commandBus = commandBus;
        this.embedding = embedding;
        this.magasin = magasin;
        this.politique = politique;
        this.objectMapper = objectMapper;
        this.topK = properties.retrieval().topK();
    }

    private record GoldenItem(String question, List<String> sourcesAttendues, boolean horsCorpus) {
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("[eval] ingestion du corpus avant evaluation...");
        commandBus.send(new IngererCorpusCommand(false));

        List<GoldenItem> golden = chargerGoldenSet();
        int corpusTotal = 0;
        int corpusRappel = 0;
        int ancrageCorrect = 0;

        log.info("[eval] {} question(s) de reference, topK={}, seuil={}",
                golden.size(), topK, politique.seuilSimilarite());

        for (GoldenItem item : golden) {
            float[] vecteur = embedding.vectoriserRequete(item.question());
            List<Passage> passages = magasin.rechercher(vecteur, topK);
            boolean ancre = politique.estAncre(passages);
            boolean predictHorsCorpus = !ancre;

            boolean ancrageOk = predictHorsCorpus == item.horsCorpus();
            if (ancrageOk) {
                ancrageCorrect++;
            }

            if (!item.horsCorpus()) {
                corpusTotal++;
                boolean rappelOk = passages.stream().anyMatch(p ->
                        item.sourcesAttendues().stream().anyMatch(s -> p.cheminSource().contains(s)));
                if (rappelOk) {
                    corpusRappel++;
                }
                double meilleur = passages.isEmpty() ? 0 : passages.getFirst().score();
                log.info("[eval] {} | rappel={} ancrage={} (meilleur score={}) | {}",
                        rappelOk ? "OK " : "MISS", rappelOk, ancrageOk,
                        String.format("%.3f", meilleur), item.question());
            } else {
                log.info("[eval] {} | refus attendu, predit refus={} | {}",
                        ancrageOk ? "OK " : "MISS", predictHorsCorpus, item.question());
            }
        }

        double rappel = corpusTotal == 0 ? 0 : (100.0 * corpusRappel / corpusTotal);
        double justesse = golden.isEmpty() ? 0 : (100.0 * ancrageCorrect / golden.size());
        log.info("[eval] ===== RESULTATS =====");
        log.info("[eval] rappel@{} (questions du corpus) : {}/{} = {}%",
                topK, corpusRappel, corpusTotal, String.format("%.1f", rappel));
        log.info("[eval] justesse repondre/refuser : {}/{} = {}%",
                ancrageCorrect, golden.size(), String.format("%.1f", justesse));
    }

    private List<GoldenItem> chargerGoldenSet() throws Exception {
        try (var in = new ClassPathResource("rag-eval/golden-set.json").getInputStream()) {
            return objectMapper.readValue(in, new TypeReference<List<GoldenItem>>() {
            });
        }
    }
}
