package fr.jegeremacartenavigo.infrastructure.config.sav;

import fr.jegeremacartenavigo.application.sav.AssignerReclamationHandler;
import fr.jegeremacartenavigo.application.sav.ChangerStatutReclamationHandler;
import fr.jegeremacartenavigo.application.sav.CreerReclamationHandler;
import fr.jegeremacartenavigo.application.sav.GetMesReclamationsHandler;
import fr.jegeremacartenavigo.application.sav.GetReclamationCountsHandler;
import fr.jegeremacartenavigo.application.sav.GetReclamationDetailHandler;
import fr.jegeremacartenavigo.application.sav.GetReclamationsHandler;
import fr.jegeremacartenavigo.application.sav.RepondreReclamationHandler;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expose les handlers CQRS des reclamations comme beans (resolus par type par
 * le {@code HandlerRegistry}). Sans ces beans, le bus ne sait pas router les
 * commandes/queries (NoHandlerFoundException).
 */
@Configuration
public class ReclamationHandlersConfig {

    @Bean
    CreerReclamationHandler creerReclamationHandler(ReclamationRepository repository) {
        return new CreerReclamationHandler(repository);
    }

    @Bean
    GetMesReclamationsHandler getMesReclamationsHandler(ReclamationRepository repository) {
        return new GetMesReclamationsHandler(repository);
    }

    @Bean
    GetReclamationDetailHandler getReclamationDetailHandler(ReclamationRepository repository) {
        return new GetReclamationDetailHandler(repository);
    }

    @Bean
    GetReclamationsHandler getReclamationsHandler(ReclamationRepository repository) {
        return new GetReclamationsHandler(repository);
    }

    @Bean
    GetReclamationCountsHandler getReclamationCountsHandler(ReclamationRepository repository) {
        return new GetReclamationCountsHandler(repository);
    }

    @Bean
    RepondreReclamationHandler repondreReclamationHandler(ReclamationRepository repository) {
        return new RepondreReclamationHandler(repository);
    }

    @Bean
    ChangerStatutReclamationHandler changerStatutReclamationHandler(ReclamationRepository repository) {
        return new ChangerStatutReclamationHandler(repository);
    }

    @Bean
    AssignerReclamationHandler assignerReclamationHandler(ReclamationRepository repository) {
        return new AssignerReclamationHandler(repository);
    }
}
