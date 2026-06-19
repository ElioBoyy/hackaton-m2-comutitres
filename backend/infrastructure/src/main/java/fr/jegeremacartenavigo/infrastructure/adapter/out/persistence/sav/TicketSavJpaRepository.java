package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface TicketSavJpaRepository extends JpaRepository<TicketSav, Integer> {

    /** Suivi client : tickets d'un utilisateur, plus recents d'abord. */
    List<TicketSav> findByUtilisateur_IdUtilisateurOrderByDateCreationDesc(Integer idUtilisateur);

    /**
     * File backoffice. {@code statuts} n'est jamais null (l'adapter passe tous
     * les statuts quand aucun filtre), ce qui evite le piege du {@code in (null)}
     * en JPQL. Recherche client sur "prenom nom" et "nom prenom".
     */
    // Les parametres optionnels sont castes en string : un parametre lie a null
    // est sinon infere en bytea par PostgreSQL, et lower(bytea) n'existe pas.
    @Query("""
            select t from TicketSav t
            left join t.utilisateur u
            where t.statut in :statuts
              and (:nomClient is null or lower(concat(u.prenom, ' ', u.nom)) like lower(concat('%', cast(:nomClient as string), '%'))
                                      or lower(concat(u.nom, ' ', u.prenom)) like lower(concat('%', cast(:nomClient as string), '%')))
              and (:reference is null or lower(t.referenceTicket) like lower(concat('%', cast(:reference as string), '%')))
            """)
    Page<TicketSav> rechercher(@Param("statuts") Collection<TicketSav.Statut> statuts,
                               @Param("nomClient") String nomClient,
                               @Param("reference") String reference,
                               Pageable pageable);

    @Query("""
            select t.statut as statut, count(t) as nb from TicketSav t
            left join t.utilisateur u
            where (:nomClient is null or lower(concat(u.prenom, ' ', u.nom)) like lower(concat('%', cast(:nomClient as string), '%'))
                                      or lower(concat(u.nom, ' ', u.prenom)) like lower(concat('%', cast(:nomClient as string), '%')))
              and (:reference is null or lower(t.referenceTicket) like lower(concat('%', cast(:reference as string), '%')))
            group by t.statut
            """)
    List<StatutCount> compterParStatut(@Param("nomClient") String nomClient,
                                       @Param("reference") String reference);

    /** Projection pour le comptage groupe par statut. */
    interface StatutCount {
        TicketSav.Statut getStatut();
        long getNb();
    }
}
