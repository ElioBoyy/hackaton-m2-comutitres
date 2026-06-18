package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface SequenceAnnuelleDossierJpaRepository extends JpaRepository<SequenceAnnuelleDossier, Integer> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM SequenceAnnuelleDossier s WHERE s.annee = :annee")
    Optional<SequenceAnnuelleDossier> findByAnneeForUpdate(Integer annee);
}
