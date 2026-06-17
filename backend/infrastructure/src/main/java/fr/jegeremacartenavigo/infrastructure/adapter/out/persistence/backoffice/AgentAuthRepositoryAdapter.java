package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import fr.jegeremacartenavigo.domain.auth.model.AgentAuth;
import fr.jegeremacartenavigo.domain.auth.port.AgentAuthRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adapter JPA implementant le port domaine {@link AgentAuthRepository}.
 * Mapping entre l'entite {@link Agent} et le record domaine {@link AgentAuth}.
 */
@Component
public class AgentAuthRepositoryAdapter implements AgentAuthRepository {

    private final AgentJpaRepository jpa;

    public AgentAuthRepositoryAdapter(AgentJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<AgentAuth> findByEmail(String email) {
        return jpa.findByEmail(email).map(AgentAuthRepositoryAdapter::toDomain);
    }

    @Override
    public Optional<AgentAuth> findById(Integer id) {
        return jpa.findById(id).map(AgentAuthRepositoryAdapter::toDomain);
    }

    private static AgentAuth toDomain(Agent e) {
        return new AgentAuth(
                e.getIdAgent(),
                e.getEmail(),
                e.getMotDePasseHash(),
                e.getNom(),
                e.getPrenom(),
                e.isActif()
        );
    }
}
