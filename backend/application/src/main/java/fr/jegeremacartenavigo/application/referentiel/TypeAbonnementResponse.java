package fr.jegeremacartenavigo.application.referentiel;

import java.math.BigDecimal;
import java.util.List;

public record TypeAbonnementResponse(
        String code,
        String libelle,
        String categorie,
        String periodicite,
        BigDecimal tarifPlein,
        List<String> transports,
        List<String> zones
) {}
