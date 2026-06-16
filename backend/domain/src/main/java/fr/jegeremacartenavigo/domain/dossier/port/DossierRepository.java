package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;

/**
 * Port secondaire : persistance d'un nouveau Dossier (avec ses pieces
 * justificatives et son paiement initial). Implementation dans la couche
 * infrastructure (adapter JPA), qui resout aussi les referentiels
 * (type_abonnement, statut_dossier, type_piece_justificative) par leur code.
 */
public interface DossierRepository {

    DossierCree enregistrer(NouveauDossier nouveauDossier);
}
