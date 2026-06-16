package fr.jegeremacartenavigo.bootstrap.rag;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.rag.ingestion.IngererCorpusCommand;
import fr.jegeremacartenavigo.application.rag.ingestion.IngestionResultat;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Ingestion du corpus au demarrage, optionnelle. Active uniquement si
 * {@code rag.ingestion-au-demarrage=true} (et donc inerte en test/CI). Idempotente
 * grace au checksum : ne re-vectorise que les documents nouveaux ou modifies.
 */
@Component
@ConditionalOnProperty(name = "rag.ingestion-au-demarrage", havingValue = "true")
public class RagIngestionRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(RagIngestionRunner.class);

    private final CommandBus commandBus;

    public RagIngestionRunner(CommandBus commandBus) {
        this.commandBus = commandBus;
    }

    @Override
    public void run(ApplicationArguments args) {
        log.info("Ingestion du corpus RAG au demarrage...");
        IngestionResultat resultat = commandBus.send(new IngererCorpusCommand(false));
        log.info("Corpus RAG pret : {} document(s), {} fragment(s) en base",
                resultat.totalDocuments(), resultat.totalFragments());
    }
}
