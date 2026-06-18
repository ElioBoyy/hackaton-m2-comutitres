package fr.jegeremacartenavigo.infrastructure.adapter.out.storage;

import fr.jegeremacartenavigo.application.fichier.FichierIntrouvableException;
import fr.jegeremacartenavigo.application.fichier.FichierStorage;
import fr.jegeremacartenavigo.application.fichier.TypePiece;
import fr.jegeremacartenavigo.infrastructure.config.storage.StorageProperties;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.ListObjectsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.Result;
import io.minio.errors.ErrorResponseException;
import io.minio.messages.Item;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Implementation MinIO du port {@link FichierStorage}. Les objets sont ranges
 * par utilisateur sous {@code users/{idUtilisateur}/...}, et par categorie
 * lorsqu'un {@link TypePiece} est fourni a l'upload :
 *
 * <pre>
 * users/{id}/{type-slug}/{horodatage}-{shortId}.{ext}   // upload type
 * users/{id}/{uuid}-{nom-assaini}                       // upload generique
 * </pre>
 *
 * Le type est ainsi recuperable au listing par simple lecture du chemin
 * (cf. {@link #typeDepuisCle}), sans appel supplementaire a MinIO.
 */
@Component
public class MinioFichierStorage implements FichierStorage {

    private final MinioClient client;
    private final StorageProperties properties;
    // Double-checked init pour ne creer le bucket qu'une fois par instance.
    // La creation au demarrage (MinioConfig.initialiserBucket) est best-effort :
    // si MinIO n'est pas joignable a ce moment-la (ordre de demarrage docker
    // non garanti), on retombe ici a la premiere requete.
    private final AtomicBoolean bucketPret = new AtomicBoolean(false);
    private final Object bucketLock = new Object();

    public MinioFichierStorage(MinioClient client, StorageProperties properties) {
        this.client = client;
        this.properties = properties;
    }

    @Override
    public String deposer(int idUtilisateur,
                          String nomOriginal,
                          String contentType,
                          long tailleOctets,
                          InputStream contenu,
                          TypePiece type) {
        assurerBucket();
        String cle = construireCle(idUtilisateur, nomOriginal, type);
        try {
            PutObjectArgs.Builder builder = PutObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(cle)
                    .stream(contenu, tailleOctets, -1);
            if (contentType != null && !contentType.isBlank()) {
                builder.contentType(contentType);
            }
            client.putObject(builder.build());
            return cle;
        } catch (Exception e) {
            throw new IllegalStateException("Echec du depot sur MinIO pour " + nomOriginal, e);
        }
    }

    private String construireCle(int idUtilisateur, String nomOriginal, TypePiece type) {
        String prefixe = prefixeUtilisateur(idUtilisateur);
        if (type == null) {
            return prefixe + UUID.randomUUID() + "-" + assainir(nomOriginal);
        }
        // Avec type : on garde l'extension d'origine pour la coherence Content-Type
        // au telechargement, et un suffixe unique (epochMs + 8 chars) qui evite
        // l'ecrasement quand l'usager re-uploade la meme categorie plusieurs fois.
        String extension = extension(nomOriginal);
        String suffixeUnique = Instant.now().toEpochMilli() + "-"
                + UUID.randomUUID().toString().substring(0, 8);
        return prefixe + type.slug() + "/" + suffixeUnique + extension;
    }

    private void assurerBucket() {
        if (bucketPret.get()) return;
        synchronized (bucketLock) {
            if (bucketPret.get()) return;
            String bucket = properties.bucket();
            try {
                boolean existe = client.bucketExists(
                        BucketExistsArgs.builder().bucket(bucket).build());
                if (!existe) {
                    client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                }
                bucketPret.set(true);
            } catch (ErrorResponseException e) {
                String code = e.errorResponse().code();
                if ("BucketAlreadyOwnedByYou".equals(code) || "BucketAlreadyExists".equals(code)) {
                    bucketPret.set(true);
                    return;
                }
                throw new IllegalStateException("Impossible d'initialiser le bucket MinIO " + bucket, e);
            } catch (Exception e) {
                throw new IllegalStateException("Impossible d'initialiser le bucket MinIO " + bucket, e);
            }
        }
    }

    /**
     * Telecharge l'objet depuis MinIO. Suit la doc officielle :
     * {@code getObject(GetObjectArgs.builder().bucket(b).object(o).build())}.
     * cf. https://min.io/docs/minio/linux/developers/java/API.html#getObject
     *
     * <p>{@link GetObjectResponse} encapsule un InputStream lie a la connexion
     * HTTP MinIO ; il est ferme par l'appelant (cf. javadoc {@link Contenu#flux}).
     */
    @Override
    public Contenu recuperer(String cle) {
        assurerBucket();
        try {
            GetObjectResponse response = client.getObject(GetObjectArgs.builder()
                    .bucket(properties.bucket())
                    .object(cle)
                    .build());
            TypePiece type = typeDepuisCle(cle);
            String nomFichier = nomFichierPourTelechargement(cle, type);
            return new Contenu(
                    response,
                    response.headers().get("Content-Type"),
                    parseLong(response.headers().get("Content-Length")),
                    nomFichier,
                    type);
        } catch (ErrorResponseException e) {
            if ("NoSuchKey".equals(e.errorResponse().code())) {
                throw new FichierIntrouvableException(cle);
            }
            throw new IllegalStateException("Echec lecture objet MinIO " + cle, e);
        } catch (Exception e) {
            throw new IllegalStateException("Echec lecture objet MinIO " + cle, e);
        }
    }

    private static long parseLong(String s) {
        if (s == null) return -1;
        try { return Long.parseLong(s); } catch (NumberFormatException e) { return -1; }
    }

    @Override
    public String prefixeUtilisateur(int idUtilisateur) {
        return "users/" + idUtilisateur + "/";
    }

    /**
     * Liste les objets sous le prefixe de l'utilisateur. Suit la doc officielle
     * MinIO Java SDK : ListObjectsArgs + iteration sur Result<Item>.
     * cf. https://min.io/docs/minio/linux/developers/java/API.html#listObjects
     */
    @Override
    public List<FichierEntree> lister(int idUtilisateur) {
        assurerBucket();
        String prefixe = prefixeUtilisateur(idUtilisateur);
        Iterable<Result<Item>> results = client.listObjects(ListObjectsArgs.builder()
                .bucket(properties.bucket())
                .prefix(prefixe)
                .recursive(true)
                .build());

        List<FichierEntree> entrees = new ArrayList<>();
        for (Result<Item> result : results) {
            try {
                Item item = result.get();
                // listObjects peut remonter des "objets repertoire" (suffixe /)
                // quand l'objet est uploade comme dossier ; on les ignore.
                if (item.isDir()) continue;
                String cle = item.objectName();
                TypePiece type = typeDepuisCle(cle);
                entrees.add(new FichierEntree(
                        cle,
                        nomFichierPourTelechargement(cle, type),
                        type,
                        item.size(),
                        item.lastModified().toInstant()));
            } catch (Exception e) {
                throw new IllegalStateException("Echec lecture liste objets MinIO", e);
            }
        }
        return entrees;
    }

    /**
     * Detecte le type a partir du chemin produit par {@link #construireCle}.
     * Format type : {@code users/{id}/{slug}/{...}} - le 3e segment est le slug.
     * Si la cle a moins de 4 segments OU si le 3e segment ne correspond pas a un
     * type connu, on retombe sur null (upload generique).
     */
    private static TypePiece typeDepuisCle(String cle) {
        int s1 = cle.indexOf('/');
        if (s1 < 0) return null;
        int s2 = cle.indexOf('/', s1 + 1);
        if (s2 < 0) return null;
        int s3 = cle.indexOf('/', s2 + 1);
        if (s3 < 0) return null;
        String slug = cle.substring(s2 + 1, s3);
        return TypePiece.fromSlug(slug);
    }

    /**
     * Nom utilise dans le Content-Disposition au telechargement. Pour une cle
     * typee, on construit un nom stable {@code piece-identite-{horodatage}.{ext}},
     * lisible et qui evite de divulguer le nom d'origine choisi par l'utilisateur
     * (qui peut contenir des infos personnelles). Pour une cle generique, on
     * extrait le nom historique (apres le UUID).
     */
    private static String nomFichierPourTelechargement(String cle, TypePiece type) {
        if (type != null) {
            int dernierSlash = cle.lastIndexOf('/');
            String segmentFinal = dernierSlash >= 0 ? cle.substring(dernierSlash + 1) : cle;
            return type.slug() + "-" + segmentFinal;
        }
        return nomFichierDepuisCleComplete(cle);
    }

    /**
     * Variante "cle complete sans prefixe connu" : strippe les deux premiers
     * segments ({@code users/{id}/}) puis l'UUID v4 + tiret du nom genere par
     * un upload generique.
     */
    private static String nomFichierDepuisCleComplete(String cle) {
        int slash1 = cle.indexOf('/');
        int slash2 = slash1 >= 0 ? cle.indexOf('/', slash1 + 1) : -1;
        String reste = slash2 >= 0 ? cle.substring(slash2 + 1) : cle;
        // 36 chars UUID + '-' = 37
        if (reste.length() > 37 && reste.charAt(36) == '-') {
            return reste.substring(37);
        }
        return reste;
    }

    /** Extension d'un nom de fichier, point inclus (ex: ".pdf") ; "" si aucune. */
    private static String extension(String nom) {
        if (nom == null) return "";
        int dot = nom.lastIndexOf('.');
        if (dot <= 0 || dot >= nom.length() - 1) return "";
        String ext = nom.substring(dot).toLowerCase();
        // Refuse les "extensions" qui ne sont en realite que des suffixes textuels :
        // on ne garde que celles composees de lettres/chiffres ASCII.
        return ext.substring(1).matches("[a-z0-9]+") ? ext : "";
    }

    /**
     * Garde uniquement les caracteres surs dans le nom (eviter les ../, espaces
     * encodes, etc. qui pourraient casser un parsing aval). Lettres ASCII,
     * chiffres, point, tiret et underscore uniquement.
     */
    private static String assainir(String nom) {
        if (nom == null || nom.isBlank()) return "fichier";
        String filtre = nom.replaceAll("[^A-Za-z0-9._-]", "_");
        return filtre.length() > 120 ? filtre.substring(filtre.length() - 120) : filtre;
    }
}
