package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import java.util.Optional;

public interface PieceJustificativeJpaRepository extends JpaRepository<PieceJustificative, Integer> {

    List<PieceJustificative> findByDossier_IdDossierOrderByDateDepotDesc(Integer idDossier);

    /**
     * Compte les pieces en_attente groupees par dossier, pour la page de
     * dossiers affichee (evite le N+1).
     */
    @Query("""
            select p.dossier.idDossier as idDossier, count(p) as total
            from PieceJustificative p
            where p.statutValidation = :statut
              and p.dossier.idDossier in :idsDossier
            group by p.dossier.idDossier
            """)
    List<NbPiecesEnAttenteParDossier> countByStatutGroupByDossier(
            @Param("statut") PieceJustificative.StatutValidation statut,
            @Param("idsDossier") List<Integer> idsDossier);

    interface NbPiecesEnAttenteParDossier {
        Integer getIdDossier();
        long getTotal();
    }
           
           // Pour upsert : remplace la piece existante du meme type sur un dossier
    // qu'on complete (idDossierExistant), au lieu d'en dupliquer une.
           Optional<PieceJustificative> findByDossier_IdDossierAndTypePiece_IdTypePiece(
            Integer idDossier, Integer idTypePiece);
}
