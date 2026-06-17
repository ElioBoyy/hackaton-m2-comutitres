package fr.jegeremacartenavigo.infrastructure.adapter.in.web.rag;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.rag.ingestion.IngererCorpusCommand;
import fr.jegeremacartenavigo.application.rag.ingestion.IngestionResultat;
import fr.jegeremacartenavigo.domain.rag.port.MagasinVecteurs;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Administration du corpus RAG : declenchement de l'ingestion et etat de la base
 * vectorielle. A proteger derriere une authentification en production (non gere
 * dans ce projet, qui n'a pas encore d'auth).
 */
@RestController
@RequestMapping("/api/admin/rag")
public class AdminRagController {

    private final CommandBus commandBus;
    private final MagasinVecteurs magasin;

    public AdminRagController(CommandBus commandBus, MagasinVecteurs magasin) {
        this.commandBus = commandBus;
        this.magasin = magasin;
    }

    @PostMapping("/ingest")
    public IngestionResultat ingerer(@RequestParam(defaultValue = "false") boolean forcer) {
        return commandBus.send(new IngererCorpusCommand(forcer));
    }

    @GetMapping("/stats")
    public Stats stats() {
        return new Stats(magasin.compterDocuments(), magasin.compterFragments());
    }

    public record Stats(long documents, long fragments) {
    }
}
