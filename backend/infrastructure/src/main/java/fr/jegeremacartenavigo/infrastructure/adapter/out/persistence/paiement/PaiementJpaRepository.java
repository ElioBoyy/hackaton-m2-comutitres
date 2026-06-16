package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaiementJpaRepository extends JpaRepository<Paiement, Integer> {
}
