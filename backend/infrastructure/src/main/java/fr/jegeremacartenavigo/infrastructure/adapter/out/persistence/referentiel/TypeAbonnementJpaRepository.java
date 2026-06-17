package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypeAbonnementJpaRepository extends JpaRepository<TypeAbonnement, Integer> {

    Optional<TypeAbonnement> findByCode(String code);
}
