package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import fr.jegeremacartenavigo.domain.referentiel.model.TypeAbonnementInfo;
import fr.jegeremacartenavigo.domain.referentiel.port.TypeAbonnementRepository;

import java.util.Arrays;
import java.util.List;

public class TypeAbonnementRepositoryAdapter implements TypeAbonnementRepository {

    private final TypeAbonnementJpaRepository jpa;

    public TypeAbonnementRepositoryAdapter(TypeAbonnementJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<TypeAbonnementInfo> findAllActifs() {
        return jpa.findAll().stream()
                .filter(TypeAbonnement::isActif)
                .map(t -> new TypeAbonnementInfo(
                        t.getCode(),
                        t.getLibelle(),
                        t.getCategorie(),
                        t.getPeriodicite().name(),
                        t.getTarifPlein(),
                        t.getTransports() != null ? Arrays.asList(t.getTransports()) : List.of(),
                        t.getZones() != null ? Arrays.asList(t.getZones()) : List.of()
                ))
                .toList();
    }
}
