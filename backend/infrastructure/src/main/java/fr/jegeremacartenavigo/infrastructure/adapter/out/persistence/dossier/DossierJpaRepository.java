package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DossierJpaRepository extends JpaRepository<Dossier, Integer> {

    Page<Dossier> findByStatutActuel_Categorie(StatutDossier.Categorie categorie, Pageable pageable);
}
