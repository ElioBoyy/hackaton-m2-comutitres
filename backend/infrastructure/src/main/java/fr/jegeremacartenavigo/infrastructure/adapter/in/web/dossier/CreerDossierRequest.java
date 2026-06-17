package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.DemandePour;
import fr.jegeremacartenavigo.domain.dossier.model.ModePaiementDossier;
import fr.jegeremacartenavigo.domain.dossier.model.SituationDemande;

/**
 * Corps JSON attendu par {@code POST /dossiers}. Volontairement sans
 * {@code idUtilisateurConnecte} : c'est le controller qui l'ajoute a partir
 * du JWT, jamais le client (cf. {@code DossierController}).
 *
 * <p>{@code idDossierExistant} (optionnel) complete un brouillon deja
 * sauvegarde au lieu d'en creer un nouveau (cf. CONTEXT.md).
 */
public record CreerDossierRequest(
        Integer idDossierExistant,
        DemandePour pourQui,
        String beneficiaireNomComplet,
        SituationDemande situation,
        String situationPrecision,
        boolean boursier,
        String codeTypeAbonnement,
        String cheminPieceIdentite,
        String cheminCertificatScolarite,
        String cheminNotificationBourse,
        ModePaiementDossier modePaiement
) {
}
