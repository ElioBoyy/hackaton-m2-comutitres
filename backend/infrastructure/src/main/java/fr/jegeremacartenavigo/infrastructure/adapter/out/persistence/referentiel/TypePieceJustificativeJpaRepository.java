package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TypePieceJustificativeJpaRepository extends JpaRepository<TypePieceJustificative, Integer> {

    Optional<TypePieceJustificative> findByCode(String code);
}
