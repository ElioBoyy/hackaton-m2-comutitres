package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

public record HistoriqueEntree(
        Integer id,
        LocalDateTime dateAction,
        String typeAction,
        String statutAvant,
        String statutApres,
        String nomAuteur,
        String description
) {}
