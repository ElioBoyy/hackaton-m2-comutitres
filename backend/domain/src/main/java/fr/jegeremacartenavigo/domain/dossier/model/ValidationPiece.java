package fr.jegeremacartenavigo.domain.dossier.model;

public record ValidationPiece(
        Integer idDossier,
        Integer idPiece,
        Integer idAgent,
        boolean valider,
        String motifRejet
) {}
