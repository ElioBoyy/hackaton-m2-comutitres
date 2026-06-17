package fr.jegeremacartenavigo.application.rag.ingestion;

import fr.jegeremacartenavigo.application.cqrs.Command;

/**
 * Declenche l'ingestion du corpus : lecture, decoupage, vectorisation, stockage.
 *
 * @param forcer si vrai, re-ingere tous les documents meme inchanges (utile
 *               apres un changement de modele d'embedding) ; sinon les documents
 *               au checksum identique sont ignores.
 */
public record IngererCorpusCommand(boolean forcer) implements Command<IngestionResultat> {
}
