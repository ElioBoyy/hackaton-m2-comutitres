package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.HistoriqueEntree;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;
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

    /**
     * Change le statut d'un dossier (action backoffice). Pose une entree
     * d'historique de type {@code changement_statut} avec statutAvant/Apres
     * pour permettre l'affichage de la transition. Idempotent : si le dossier
     * est deja dans {@code codeStatut}, no-op.
     */
    void changerStatut(Integer idDossier, fr.jegeremacartenavigo.domain.dossier.model.CodeStatutDossier codeStatut, Integer idAgent);

    void supprimer(Integer id);

    /**
     * Ajoute une nouvelle piece au dossier.
     *
     * <p>Si {@code parAgent=true} (action backoffice), le dossier doit etre
     * EN_VERIFICATION ou INCOMPLET, et la pièce est marquee
     * {@code modifieParAgent=true}. Si {@code parAgent=false} (action client),
     * le dossier doit etre BROUILLON / EN_ATTENTE_PAIEMENT / INCOMPLET et
     * {@code idAuteur} doit etre le porteur du dossier ; la pièce reste
     * {@code modifieParAgent=false}.
     *
     * <p>Si une piece du meme type existe deja sur le dossier, lance
     * {@code IllegalStateException} - l'appelant doit utiliser
     * {@link #remplacerFichierPiece}. Enregistre une entree d'historique
     * {@code depot_piece} (avec agent ou utilisateur selon le contexte).
     */
    PieceJustificativeResume ajouterPiece(Integer idDossier, Integer idAuteur, String codeTypePiece, String cheminFichier, boolean parAgent);

    /**
     * Remplace le fichier d'une piece existante.
     *
     * <p>Mêmes regles de statut/ownership que {@link #ajouterPiece}. La pièce
     * est remise a {@code en_attente}, motifRejet/agentValidation/dateValidation
     * effaces. Quand {@code parAgent=true}, {@code modifieParAgent} passe a
     * {@code true} ; sinon (client) il repasse a {@code false}.
     */
    PieceJustificativeResume remplacerFichierPiece(Integer idDossier, Integer idPiece, Integer idAuteur, String cheminFichier, boolean parAgent);

    /**
     * Verifie que l'auteur peut editer les pieces du dossier (ownership pour
     * un client, statut autorise pour l'un et l'autre). Lance les memes exceptions
     * que {@link #ajouterPiece} / {@link #remplacerFichierPiece} ; permet au
     * controller de refuser AVANT l'upload sur MinIO pour eviter les fichiers
     * orphelins. Retourne l'id de l'utilisateur porteur du dossier, necessaire
     * pour scope-er le prefixe MinIO de l'upload.
     */
    Integer verifierEditable(Integer idDossier, Integer idAuteur, boolean parAgent);

    /**
     * Active un dossier : passe au statut ACTIF, pose {@code dateDebutDroits}
     * et calcule {@code dateFinDroits} a partir de la periodicite du type
     * d'abonnement. Le dossier doit etre en statut VALIDE.
     */
    void activerDossier(Integer idDossier, Integer idAgent, java.time.LocalDate dateDebutDroits);
}
