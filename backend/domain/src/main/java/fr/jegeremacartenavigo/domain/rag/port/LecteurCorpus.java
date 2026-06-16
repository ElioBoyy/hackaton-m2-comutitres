package fr.jegeremacartenavigo.domain.rag.port;

import fr.jegeremacartenavigo.domain.rag.model.DocumentCorpus;

import java.util.List;

/**
 * Port de lecture du corpus a ingerer. Implemente en infrastructure (lecture des
 * fichiers markdown depuis le classpath ou le systeme de fichiers).
 */
public interface LecteurCorpus {

    /** Lit l'integralite des documents du corpus. */
    List<DocumentCorpus> lireTout();
}
