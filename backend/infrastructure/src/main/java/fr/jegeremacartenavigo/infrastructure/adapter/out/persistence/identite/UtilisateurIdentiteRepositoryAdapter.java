package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

import fr.jegeremacartenavigo.domain.dossier.model.UtilisateurIdentite;
import fr.jegeremacartenavigo.domain.dossier.port.UtilisateurIdentiteRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Adapter JPA implementant le port domaine {@link UtilisateurIdentiteRepository}.
 */
@Component
public class UtilisateurIdentiteRepositoryAdapter implements UtilisateurIdentiteRepository {

    private final UtilisateurJpaRepository jpa;

    public UtilisateurIdentiteRepositoryAdapter(UtilisateurJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<UtilisateurIdentite> findById(Integer idUtilisateur) {
        return jpa.findById(idUtilisateur).map(UtilisateurIdentiteRepositoryAdapter::toDomain);
    }

    static UtilisateurIdentite toDomain(Utilisateur e) {
        return new UtilisateurIdentite(e.getIdUtilisateur(), e.getNom(), e.getPrenom());
    }
}
