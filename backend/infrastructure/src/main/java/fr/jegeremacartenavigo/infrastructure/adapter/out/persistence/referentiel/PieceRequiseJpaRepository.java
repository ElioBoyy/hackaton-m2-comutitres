package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PieceRequiseJpaRepository extends JpaRepository<PieceRequise, Integer> {
    List<PieceRequise> findByTypeAbonnement_Code(String codeTypeAbonnement);
}
