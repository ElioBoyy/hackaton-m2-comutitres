package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StatutDossierJpaRepository extends JpaRepository<StatutDossier, Integer> {

    Optional<StatutDossier> findByCode(String code);
}
