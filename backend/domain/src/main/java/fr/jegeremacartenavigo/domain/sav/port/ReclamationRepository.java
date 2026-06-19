package fr.jegeremacartenavigo.domain.sav.port;

import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.sav.model.NouvelleReclamation;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;
import fr.jegeremacartenavigo.domain.sav.model.ReclamationResume;
import fr.jegeremacartenavigo.domain.sav.model.StatutReclamation;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Port secondaire : persistance des reclamations (tickets SAV) au-dessus des
 * tables {@code ticket_sav} + {@code historique_ticket}. Implementation dans la
 * couche infrastructure (adapter JPA).
 */
public interface ReclamationRepository {

    /** Ouvre une reclamation cote client (origine {@code utilisateur_direct}). */
    Reclamation creer(NouvelleReclamation nouvelle);

    /** Reclamations d'un utilisateur, plus recentes d'abord (suivi client). */
    List<ReclamationResume> findByUtilisateur(Integer idUtilisateur);

    /**
     * Liste paginee pour le backoffice.
     *
     * @param groupeStatut filtre optionnel sur le groupe de statut
     *                     (ouvert/en_cours/resolu/ferme), {@code null} = pas de filtre
     * @param nomClient    recherche insensible a la casse sur le nom du client, {@code null} = pas de filtre
     * @param reference    recherche insensible a la casse sur la reference, {@code null} = pas de filtre
     */
    PageResult<ReclamationResume> findPage(String groupeStatut, String nomClient, String reference, int page, int pageSize);

    /** Nombre de reclamations par groupe de statut (backoffice), avec filtre optionnel. */
    Map<String, Long> countByGroupe(String nomClient, String reference);

    /**
     * Detail d'une reclamation.
     *
     * @param idProprietaire si non {@code null}, l'acces est restreint au client
     *                       proprietaire (ownership) ; si {@code null}, acces agent
     */
    Optional<Reclamation> findDetail(Integer id, Integer idProprietaire);

    /** Ajoute un message au fil. {@code parAgent=false} = message client. */
    Reclamation ajouterMessage(Integer idReclamation, String contenu, boolean parAgent, Integer idAuteur);

    /** Change le statut (action agent). Pose une entree d'historique. */
    Reclamation changerStatut(Integer idReclamation, StatutReclamation statut, Integer idAgent);

    /** Assigne la reclamation a un agent. */
    Reclamation assigner(Integer idReclamation, Integer idAgent);
}
