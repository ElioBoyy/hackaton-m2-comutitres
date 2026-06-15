package fr.jegeremacartenavigo.infrastructure.config;

import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Active la persistance JPA sur la couche infrastructure.
 *
 * <p>Necessaire car la classe principale ({@code BootstrapApplication}) vit dans
 * un package frere : sans cette config, l'auto-detection des entites et des
 * repositories ne couvrirait pas {@code infrastructure}.
 */
@Configuration
@EntityScan(basePackages = "fr.jegeremacartenavigo.infrastructure.adapter.out.persistence")
@EnableJpaRepositories(basePackages = "fr.jegeremacartenavigo.infrastructure.adapter.out.persistence")
public class PersistenceConfig {
}
