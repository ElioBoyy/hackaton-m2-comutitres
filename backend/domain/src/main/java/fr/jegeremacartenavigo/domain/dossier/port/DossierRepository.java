package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.HistoriqueEntree;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;
import fr.jegeremacartenavigo.domain.dossier.model.ValidationPiece;

import java.util.List;
import java.util.Optional;

/**
 * Port secondaire : acces en lecture aux dossiers pour le backoffice.
 * Implementation dans la couche infrastructure (adapter JPA).
 */
public interface DossierRepository {

    /**
     * @param categorieStatut filtre optionnel (en_cours/abouti/rejete/clos), {@code null} = pas de filtre
     * @param nomClient       recherche insensible à la casse sur le nom complet du titulaire, {@code null} = pas de filtre
     * @param numeroDossier   recherche insensible à la casse sur le numéro de dossier, {@code null} = pas de filtre ; ignoré si nomClient non null
     */
    PageResult<DossierResume> findPage(String categorieStatut, String nomClient, String numeroDossier, int page, int pageSize);

    Optional<DossierDetail> findDetailById(Integer id);
    DossierCree enregistrer(NouveauDossier nouveauDossier);

    /** Nombre de dossiers par categorie de statut. */
    java.util.Map<String, Long> countByCategorie();

    void resilier(Integer id);
    void soumettre(Integer id);
    void ajouterOuRemplacerPieces(Integer idDossier, java.util.List<fr.jegeremacartenavigo.domain.dossier.model.PieceADeposer> pieces);
    /** Nombre de dossiers par categorie de statut, avec filtre optionnel de recherche. */
    java.util.Map<String, Long> countByCategorie(String nomClient, String numeroDossier);

    List<HistoriqueEntree> findHistoriqueByDossierId(Integer idDossier);

    void validerOuRejeterPiece(ValidationPiece validation);

    void supprimer(Integer id);
}
