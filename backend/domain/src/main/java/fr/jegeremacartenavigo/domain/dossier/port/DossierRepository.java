package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;

import java.util.Optional;

/**
 * Port secondaire : acces en lecture aux dossiers pour le backoffice.
 * Implementation dans la couche infrastructure (adapter JPA).
 */
public interface DossierRepository {

    /**
     * @param categorieStatut filtre optionnel (en_cours/abouti/rejete/clos), {@code null} = pas de filtre
     */
    PageResult<DossierResume> findPage(String categorieStatut, int page, int pageSize);

    Optional<DossierDetail> findDetailById(Integer id);
    DossierCree enregistrer(NouveauDossier nouveauDossier);
}
