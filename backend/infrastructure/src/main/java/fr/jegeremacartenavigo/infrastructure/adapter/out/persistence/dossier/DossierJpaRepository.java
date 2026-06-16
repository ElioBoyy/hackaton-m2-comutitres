package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DossierJpaRepository extends JpaRepository<Dossier, Integer> {
}
