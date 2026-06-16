package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PieceJustificativeJpaRepository extends JpaRepository<PieceJustificative, Integer> {

    // Pour upsert : remplace la piece existante du meme type sur un dossier
    // qu'on complete (idDossierExistant), au lieu d'en dupliquer une.
    Optional<PieceJustificative> findByDossier_IdDossierAndTypePiece_IdTypePiece(
            Integer idDossier, Integer idTypePiece);
}
