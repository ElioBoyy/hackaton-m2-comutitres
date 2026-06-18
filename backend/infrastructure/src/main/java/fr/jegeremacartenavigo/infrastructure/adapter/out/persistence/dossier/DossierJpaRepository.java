package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;


public interface DossierJpaRepository extends JpaRepository<Dossier, Integer> {

    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where sd.code <> 'BROUILLON'
            order by d.dateCreation desc
            """)
    Page<Dossier> findAllExceptBrouillon(Pageable pageable);

    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where sd.categorie = :categorie and sd.code <> 'BROUILLON'
            order by d.dateCreation desc
            """)
    Page<Dossier> findByCategorieExceptBrouillon(@Param("categorie") StatutDossier.Categorie categorie, Pageable pageable);

    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where sd.code <> 'BROUILLON'
              and (lower(concat(concat(up.prenom, ' '), up.nom)) like lower(concat(concat('%', :terme), '%'))
                or lower(concat(concat(up.nom, ' '), up.prenom)) like lower(concat(concat('%', :terme), '%')))
            order by d.dateCreation desc
            """)
    Page<Dossier> findByNomClient(@Param("terme") String terme, Pageable pageable);

    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where sd.categorie = :categorie and sd.code <> 'BROUILLON'
              and (lower(concat(concat(up.prenom, ' '), up.nom)) like lower(concat(concat('%', :terme), '%'))
                or lower(concat(concat(up.nom, ' '), up.prenom)) like lower(concat(concat('%', :terme), '%')))
            order by d.dateCreation desc
            """)
    Page<Dossier> findByNomClientAndCategorie(@Param("categorie") StatutDossier.Categorie categorie,
                                               @Param("terme") String terme, Pageable pageable);

    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where sd.code <> 'BROUILLON'
              and lower(d.numeroDossier) like lower(concat(concat('%', :terme), '%'))
            order by d.dateCreation desc
            """)
    Page<Dossier> findByNumeroDossier(@Param("terme") String terme, Pageable pageable);

    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where sd.categorie = :categorie and sd.code <> 'BROUILLON'
              and lower(d.numeroDossier) like lower(concat(concat('%', :terme), '%'))
            order by d.dateCreation desc
            """)
    Page<Dossier> findByNumeroDossierAndCategorie(@Param("categorie") StatutDossier.Categorie categorie,
                                                   @Param("terme") String terme, Pageable pageable);

    /**
     * Dossiers ou l'utilisateur est porteur et/ou payeur (un dossier ou il
     * est les deux n'apparait qu'une fois - la condition OR porte sur une
     * seule ligne dossier, pas besoin de {@code distinct} : avec deux join
     * fetch *-to-one vers la meme table utilisateur, Hibernate l'applique mal
     * et fait disparaitre des dossiers legitimes). Join fetch porteur/payeur/
     * statut/type d'abonnement : tout est charge dans cette seule requete,
     * pas de lazy-loading hors transaction ensuite (cf. open-in-view: false).
     */
    @Query("""
            select d from Dossier d
            join fetch d.utilisateurPorteur up
            join fetch d.utilisateurPayeur pp
            join fetch d.statutActuel sd
            join fetch d.typeAbonnement ta
            where up.idUtilisateur = :idUtilisateur or pp.idUtilisateur = :idUtilisateur
            order by d.dateCreation desc
            """)
    List<Dossier> findAllPourUtilisateur(@Param("idUtilisateur") Integer idUtilisateur);

    @Query("SELECT d.statutActuel.categorie, COUNT(d) FROM Dossier d JOIN d.statutActuel sd WHERE sd.code <> 'BROUILLON' GROUP BY d.statutActuel.categorie")
    List<Object[]> countGroupByCategorie();

    @Query("""
            select d.statutActuel.categorie, count(d) from Dossier d
            join d.utilisateurPorteur up
            join d.statutActuel sd
            where sd.code <> 'BROUILLON'
              and (lower(concat(concat(up.prenom, ' '), up.nom)) like lower(concat(concat('%', :terme), '%'))
                or lower(concat(concat(up.nom, ' '), up.prenom)) like lower(concat(concat('%', :terme), '%')))
            group by d.statutActuel.categorie
            """)
    List<Object[]> countByNomClientGroupByCategorie(@Param("terme") String terme);

    @Query("""
            select d.statutActuel.categorie, count(d) from Dossier d
            join d.statutActuel sd
            where sd.code <> 'BROUILLON'
              and lower(d.numeroDossier) like lower(concat(concat('%', :terme), '%'))
            group by d.statutActuel.categorie
            """)
    List<Object[]> countByNumeroDossierGroupByCategorie(@Param("terme") String terme);
}
