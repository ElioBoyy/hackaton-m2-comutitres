package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PaiementJpaRepository extends JpaRepository<Paiement, Integer> {

    /** True si au moins un Paiement existe pour ce dossier (peu importe son statut). */
    boolean existsByDossier_IdDossier(Integer idDossier);
}
