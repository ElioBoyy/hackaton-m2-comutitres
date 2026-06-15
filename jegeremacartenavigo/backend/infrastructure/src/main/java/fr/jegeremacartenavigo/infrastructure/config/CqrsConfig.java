package fr.jegeremacartenavigo.infrastructure.config;

import fr.jegeremacartenavigo.application.cqrs.middleware.LoggingBehavior;
import fr.jegeremacartenavigo.application.cqrs.middleware.ValidationBehavior;
import jakarta.validation.Validator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expose les middlewares applicatifs (definis - sans Spring - dans la couche
 * application) comme beans, afin que le {@code RequestDispatcher} les branche
 * dans le pipeline CQRS.
 *
 * <p>Pour ajouter un middleware transverse (transaction, metriques, cache...),
 * il suffit d'exposer un nouveau bean {@code PipelineBehavior} ici.
 */
@Configuration
public class CqrsConfig {

    @Bean
    public LoggingBehavior loggingBehavior() {
        return new LoggingBehavior();
    }

    @Bean
    public ValidationBehavior validationBehavior(Validator validator) {
        return new ValidationBehavior(validator);
    }
}
