package fr.jegeremacartenavigo.domain.referentiel.port;

import fr.jegeremacartenavigo.domain.referentiel.model.TypeAbonnementInfo;

import java.util.List;

public interface TypeAbonnementRepository {

    List<TypeAbonnementInfo> findAllActifs();
}
