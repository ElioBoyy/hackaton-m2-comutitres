package fr.jegeremacartenavigo.infrastructure.config.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration du stockage S3/MinIO (prefixe {@code app.storage.*}). En dev,
 * pointe vers le conteneur MinIO lance par {@code compose.yaml}. En prod,
 * surcharge via les variables d'env {@code APP_STORAGE_ENDPOINT},
 * {@code APP_STORAGE_ACCESS_KEY}, {@code APP_STORAGE_SECRET_KEY}.
 *
 * @param endpoint   URL de l'API S3 (ex: http://localhost:9000)
 * @param accessKey  cle d'acces (jgmcn en dev)
 * @param secretKey  secret (jgmcnjgmcn en dev - surcharger en prod)
 * @param bucket     nom du bucket prive ou ranger les pieces justificatives
 * @param region     region S3 (utile pour les SDK qui l'exigent ; MinIO l'ignore)
 */
@ConfigurationProperties(prefix = "app.storage")
public record StorageProperties(
        String endpoint,
        String accessKey,
        String secretKey,
        String bucket,
        String region
) {
}
