package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DossierJpaRepository extends JpaRepository<Dossier, Integer> {

    Page<Dossier> findByStatutActuel_Categorie(StatutDossier.Categorie categorie, Pageable pageable);

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
}
