package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistoriqueDossierJpaRepository extends JpaRepository<HistoriqueDossier, Integer> {

    List<HistoriqueDossier> findByDossier_IdDossierOrderByDateActionDesc(Integer idDossier);
}
