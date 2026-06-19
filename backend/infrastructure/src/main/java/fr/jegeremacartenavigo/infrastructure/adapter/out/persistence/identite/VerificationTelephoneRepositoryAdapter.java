package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

import fr.jegeremacartenavigo.domain.identite.model.EtatVerificationTelephone;
import fr.jegeremacartenavigo.domain.identite.port.VerificationTelephoneRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Adapter JPA du port {@link VerificationTelephoneRepository} : lit et met a jour
 * les colonnes de verification telephone portees par l'entite {@link Utilisateur}.
 */
@Component
public class VerificationTelephoneRepositoryAdapter implements VerificationTelephoneRepository {

    private final UtilisateurJpaRepository jpa;

    public VerificationTelephoneRepositoryAdapter(UtilisateurJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public Optional<EtatVerificationTelephone> charger(Integer utilisateurId) {
        return jpa.findById(utilisateurId).map(u -> new EtatVerificationTelephone(
                u.getIdUtilisateur(),
                u.getTelephone(),
                u.isTelephoneVerifie(),
                u.getTelephonePinId()));
    }

    @Override
    @Transactional
    public void enregistrerPinId(Integer utilisateurId, String pinId) {
        jpa.findById(utilisateurId).ifPresent(u -> {
            u.setTelephonePinId(pinId);
            jpa.save(u);
        });
    }

    @Override
    @Transactional
    public void marquerVerifie(Integer utilisateurId) {
        jpa.findById(utilisateurId).ifPresent(u -> {
            u.setTelephoneVerifie(true);
            u.setTelephonePinId(null);
            jpa.save(u);
        });
    }
}
