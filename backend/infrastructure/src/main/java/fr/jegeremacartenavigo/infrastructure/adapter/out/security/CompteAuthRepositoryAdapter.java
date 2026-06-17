package fr.jegeremacartenavigo.infrastructure.adapter.out.security;

import fr.jegeremacartenavigo.domain.auth.model.AgentAuth;
import fr.jegeremacartenavigo.domain.auth.model.CompteAuth;
import fr.jegeremacartenavigo.domain.auth.model.RoleCompte;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.AgentAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.CompteAuthRepository;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Compose {@link UtilisateurAuthRepository} et {@link AgentAuthRepository}
 * pour offrir une recherche unique par email, quel que soit le type de compte
 * (client ou agent). Un trigger BDD (cf. migration V10) garantit qu'un meme
 * email ne peut pas exister dans les deux tables a la fois, donc l'ordre de
 * recherche ci-dessous n'a pas d'incidence en pratique.
 */
@Component
public class CompteAuthRepositoryAdapter implements CompteAuthRepository {

    private final UtilisateurAuthRepository utilisateurAuthRepository;
    private final AgentAuthRepository agentAuthRepository;

    public CompteAuthRepositoryAdapter(UtilisateurAuthRepository utilisateurAuthRepository,
                                        AgentAuthRepository agentAuthRepository) {
        this.utilisateurAuthRepository = utilisateurAuthRepository;
        this.agentAuthRepository = agentAuthRepository;
    }

    @Override
    public Optional<CompteAuth> findByEmail(String email) {
        Optional<CompteAuth> client = utilisateurAuthRepository.findByEmail(email).map(this::fromUtilisateur);
        if (client.isPresent()) {
            return client;
        }
        return agentAuthRepository.findByEmail(email).map(this::fromAgent);
    }

    private CompteAuth fromUtilisateur(UtilisateurAuth u) {
        return new CompteAuth(u.id(), u.email(), u.motDePasseHash(), u.nom(), u.prenom(),
                RoleCompte.CLIENT, u.estActif());
    }

    private CompteAuth fromAgent(AgentAuth a) {
        return new CompteAuth(a.id(), a.email(), a.motDePasseHash(), a.nom(), a.prenom(),
                RoleCompte.AGENT, a.estActif());
    }
}
