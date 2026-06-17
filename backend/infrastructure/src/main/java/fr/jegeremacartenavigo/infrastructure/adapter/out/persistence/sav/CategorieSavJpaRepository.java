package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieSavJpaRepository extends JpaRepository<CategorieSav, Integer> {

    Optional<CategorieSav> findByCode(String code);
}
