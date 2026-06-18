package fr.jegeremacartenavigo.infrastructure.config.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.errors.ErrorResponseException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

/**
 * Cable le bean {@link MinioClient} et bootstrap le bucket prive au demarrage
 * (idempotent). Le contenu des pieces n'est jamais exposé publiquement : le
 * backend stream l'objet via {@code GET /fichiers/contenu} apres verification
 * JWT (cf. {@code FichierController}), il n'y a plus d'URLs pre-signees.
 */
@Configuration
public class MinioConfig {

    private static final Logger log = LoggerFactory.getLogger(MinioConfig.class);

    private final StorageProperties properties;

    public MinioConfig(StorageProperties properties) {
        this.properties = properties;
    }

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(properties.endpoint())
                .credentials(properties.accessKey(), properties.secretKey())
                .build();
    }

    /**
     * Bootstrap du bucket prive cible. Idempotent : on ne fait rien s'il
     * existe deja (course possible avec un autre demarrage : on swallow le
     * BucketAlreadyOwnedByYou pour rester safe).
     */
    @EventListener(ApplicationReadyEvent.class)
    public void initialiserBucket() {
        String bucket = properties.bucket();
        MinioClient client = minioClient();
        try {
            boolean existe = client.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build());
            if (existe) {
                log.info("Bucket MinIO '{}' deja present", bucket);
                return;
            }
            client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
            log.info("Bucket MinIO '{}' cree (prive par defaut)", bucket);
        } catch (ErrorResponseException e) {
            // Race entre instances : un autre process a deja cree le bucket.
            if ("BucketAlreadyOwnedByYou".equals(e.errorResponse().code())
                    || "BucketAlreadyExists".equals(e.errorResponse().code())) {
                log.info("Bucket MinIO '{}' deja cree par un autre process", bucket);
                return;
            }
            throw new IllegalStateException("Impossible d'initialiser le bucket MinIO " + bucket, e);
        } catch (Exception e) {
            throw new IllegalStateException("Impossible d'initialiser le bucket MinIO " + bucket, e);
        }
    }
}
