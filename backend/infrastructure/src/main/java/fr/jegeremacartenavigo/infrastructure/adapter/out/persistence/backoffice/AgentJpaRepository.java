package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AgentJpaRepository extends JpaRepository<Agent, Integer> {
}
