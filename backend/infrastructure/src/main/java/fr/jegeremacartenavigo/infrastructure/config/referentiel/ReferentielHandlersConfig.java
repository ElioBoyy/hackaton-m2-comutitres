package fr.jegeremacartenavigo.infrastructure.config.referentiel;

import fr.jegeremacartenavigo.application.referentiel.GetTypesAbonnementsHandler;
import fr.jegeremacartenavigo.domain.referentiel.port.TypeAbonnementRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnementRepositoryAdapter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ReferentielHandlersConfig {

    @Bean
    TypeAbonnementRepository typeAbonnementRepository(TypeAbonnementJpaRepository jpa) {
        return new TypeAbonnementRepositoryAdapter(jpa);
    }

    @Bean
    GetTypesAbonnementsHandler getTypesAbonnementsHandler(TypeAbonnementRepository repository) {
        return new GetTypesAbonnementsHandler(repository);
    }
}
