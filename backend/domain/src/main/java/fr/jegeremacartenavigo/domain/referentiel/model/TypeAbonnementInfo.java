package fr.jegeremacartenavigo.domain.referentiel.model;

import java.math.BigDecimal;
import java.util.List;

public record TypeAbonnementInfo(
        String code,
        String libelle,
        String categorie,
        String periodicite,
        BigDecimal tarifPlein,
        String description,
        List<String> transports,
        List<String> zones
) {}
