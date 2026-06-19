package fr.jegeremacartenavigo.domain.dossier.model;

import java.time.LocalDateTime;

public record HistoriqueEntree(
        Integer id,
        LocalDateTime dateAction,
        String typeAction,
        String statutAvant,
        String statutApres,
        String nomAuteur,
        /** True si l'auteur est un agent backoffice (vs un utilisateur client).
         *  Permet a l'UI d'afficher un suffixe "(agent)" derriere le nom. */
        boolean auteurEstAgent,
        String description
) {}
