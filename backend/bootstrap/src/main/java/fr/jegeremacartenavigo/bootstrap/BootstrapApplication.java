package fr.jegeremacartenavigo.bootstrap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Composition root de l'application jegeremacartenavigo.
 *
 * <p>{@code scanBasePackages} couvre toute la base {@code fr.jegeremacartenavigo}
 * pour decouvrir les beans des couches infrastructure et application (qui
 * vivent dans des packages freres de celui-ci).
 */
@SpringBootApplication(scanBasePackages = "fr.jegeremacartenavigo")
@ConfigurationPropertiesScan("fr.jegeremacartenavigo")
@EnableScheduling
public class BootstrapApplication {

    public static void main(String[] args) {
        SpringApplication.run(BootstrapApplication.class, args);
    }
}
