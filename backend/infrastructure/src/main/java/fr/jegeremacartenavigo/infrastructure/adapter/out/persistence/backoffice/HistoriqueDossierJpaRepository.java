package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HistoriqueDossierJpaRepository extends JpaRepository<HistoriqueDossier, Integer> {
}
