package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AgentJpaRepository extends JpaRepository<Agent, Integer> {

    Optional<Agent> findByEmail(String email);
}
