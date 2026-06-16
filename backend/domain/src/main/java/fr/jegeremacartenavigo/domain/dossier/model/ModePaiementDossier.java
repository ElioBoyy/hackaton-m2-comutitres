package fr.jegeremacartenavigo.domain.dossier.model;

/**
 * Moyen de paiement choisi a l'etape Paiement du RecommendationWizard front
 * (cf. CONTEXT.md). Aucune donnee sensible (IBAN, numero de carte, RUM/ICS)
 * n'est transmise ni stockee : seul le moyen choisi est persiste, le paiement
 * lui-meme reste un mock (pas de vraie integration CB/SEPA).
 */
public enum ModePaiementDossier {
    CB,
    SEPA
}
