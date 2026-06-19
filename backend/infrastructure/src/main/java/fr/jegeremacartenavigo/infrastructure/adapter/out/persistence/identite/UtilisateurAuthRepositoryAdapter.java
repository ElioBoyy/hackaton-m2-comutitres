package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

import fr.jegeremacartenavigo.domain.auth.exception.EmailDejaUtiliseException;
import fr.jegeremacartenavigo.domain.auth.model.AdresseDomicile;
import fr.jegeremacartenavigo.domain.auth.model.StatutCompte;
import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.UtilisateurAuthRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.Departement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.DepartementJpaRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

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
    private final AdresseJpaRepository adresseJpa;
    private final DepartementJpaRepository departementJpa;

    public UtilisateurAuthRepositoryAdapter(UtilisateurJpaRepository jpa,
                                            AdresseJpaRepository adresseJpa,
                                            DepartementJpaRepository departementJpa) {
        this.jpa = jpa;
        this.adresseJpa = adresseJpa;
        this.departementJpa = departementJpa;
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
    @Transactional
    public UtilisateurAuth save(UtilisateurAuth domaine) {
        Utilisateur entite = new Utilisateur();
        entite.setEmail(domaine.email());
        entite.setMotDePasseHash(domaine.motDePasseHash());
        entite.setNom(domaine.nom());
        entite.setPrenom(domaine.prenom());
        entite.setDateNaissance(domaine.dateNaissance());
        entite.setTelephone(domaine.telephone());
        entite.setDateCreationCompte(LocalDateTime.now());
        entite.setStatutCompte(Utilisateur.StatutCompte.valueOf(domaine.statut().name()));
        try {
            Utilisateur saved = jpa.save(entite);
            AdresseDomicile adr = domaine.adresseDomicile();
            if (adr != null) {
                Departement departement = ensureDepartement(adr.departementCode(), adr.departementLibelle());
                Adresse adresse = new Adresse();
                adresse.setUtilisateur(saved);
                adresse.setTypeAdresse(Adresse.TypeAdresse.domicile);
                adresse.setNumeroEtVoie(adr.numeroEtVoie());
                adresse.setCodePostal(adr.codePostal());
                adresse.setVille(adr.ville());
                adresse.setDepartement(departement);
                adresse.setPrincipale(true);
                adresseJpa.save(adresse);
            }
            return toDomain(saved);
        } catch (DataIntegrityViolationException e) {
            // existsByEmail() ne verifie que la table utilisateur ; cette collision
            // cross-table (email deja pris par un agent) est detectee par le
            // trigger BDD (cf. migration V10) et remonte ici.
            throw new EmailDejaUtiliseException();
        }
    }

    private Departement ensureDepartement(String code, String libelle) {
        return departementJpa.findById(code).orElseGet(() -> {
            Departement d = new Departement();
            d.setIdDepartement(code);
            d.setLibelle(libelle);
            return departementJpa.save(d);
        });
    }

    private static UtilisateurAuth toDomain(Utilisateur e) {
        return new UtilisateurAuth(
                e.getIdUtilisateur(),
                e.getEmail(),
                e.getMotDePasseHash(),
                e.getNom(),
                e.getPrenom(),
                e.getDateNaissance(),
                e.getTelephone(),
                null,
                StatutCompte.valueOf(e.getStatutCompte().name())
        );
    }
}
