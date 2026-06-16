package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

import fr.jegeremacartenavigo.domain.auth.model.StatutCompte;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Adapter JPA implementant le port domaine {@link UtilisateurAuthRepository}.
 * Mapping entre l'entite {@link Utilisateur} et le record domaine
 * {@link UtilisateurAuth}.
 */
@Component
public class UtilisateurAuthRepositoryAdapter implements UtilisateurAuthRepository {

    private final UtilisateurJpaRepository jpa;

    public UtilisateurAuthRepositoryAdapter(UtilisateurJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<UtilisateurAuth> findByEmail(String email) {
        return jpa.findByEmail(email).map(UtilisateurAuthRepositoryAdapter::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return jpa.existsByEmail(email);
    }

    @Override
    public Optional<UtilisateurAuth> findById(Integer id) {
        return jpa.findById(id).map(UtilisateurAuthRepositoryAdapter::toDomain);
    }

    @Override
    public UtilisateurAuth save(UtilisateurAuth domaine) {
        Utilisateur entite = new Utilisateur();
        entite.setEmail(domaine.email());
        entite.setMotDePasseHash(domaine.motDePasseHash());
        entite.setNom(domaine.nom());
        entite.setPrenom(domaine.prenom());
        entite.setDateNaissance(domaine.dateNaissance());
        entite.setDateCreationCompte(LocalDateTime.now());
        entite.setStatutCompte(Utilisateur.StatutCompte.valueOf(domaine.statut().name()));
        return toDomain(jpa.save(entite));
    }

    private static UtilisateurAuth toDomain(Utilisateur e) {
        return new UtilisateurAuth(
                e.getIdUtilisateur(),
                e.getEmail(),
                e.getMotDePasseHash(),
                e.getNom(),
                e.getPrenom(),
                e.getDateNaissance(),
                StatutCompte.valueOf(e.getStatutCompte().name())
        );
    }
}
