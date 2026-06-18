package fr.jegeremacartenavigo.infrastructure.adapter.in.web.fichier;

import fr.jegeremacartenavigo.application.fichier.FichierIntrouvableException;
import fr.jegeremacartenavigo.application.fichier.FichierStorage;
import fr.jegeremacartenavigo.application.fichier.FichierStorage.Contenu;
import fr.jegeremacartenavigo.application.fichier.TypePiece;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Set;

/**
 * Upload, listing et lecture proxifiee des pieces justificatives. Toutes les
 * routes tombent sous {@code anyRequest().authenticated()} de SecurityConfig.
 *
 * <p>Le contenu d'une piece est servi via {@code GET /fichiers/contenu} : le
 * backend re-stream l'objet depuis MinIO apres verification du prefixe
 * utilisateur. Pas d'URL pre-signee : sans JWT valide, aucun acces possible
 * au contenu. Le bucket reste prive cote MinIO.
 */
@RestController
@RequestMapping("/fichiers")
public class FichierController {

    /**
     * Types MIME servis en {@code inline} (le navigateur les affiche dans le
     * tab). Tout le reste est servi en {@code attachment} pour eviter qu'un
     * fichier malicieux (HTML, SVG avec JS, etc.) ne soit execute dans
     * l'origine du backend, ce qui ouvrirait une XSS sur les cookies/localStorage
     * de l'app. SVG est volontairement exclus de l'allow-list inline car il
     * peut contenir des scripts.
     */
    private static final Set<String> TYPES_AFFICHABLES_INLINE = Set.of(
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
            "text/plain"
    );

    private final FichierStorage storage;

    public FichierController(FichierStorage storage) {
        this.storage = storage;
    }

    /**
     * Liste les pieces. Comportement selon le role (cf. claim {@code type}
     * porte par le JWT, converti en authority par {@code JwtRoleConverter}) :
     *
     * <ul>
     *   <li>client : liste uniquement SES pieces ; {@code idUtilisateur} ignore.</li>
     *   <li>agent (service client) : doit fournir {@code ?idUtilisateur=…}
     *       pour consulter celles d'un usager precis.</li>
     * </ul>
     */
    @GetMapping
    public List<FichierListeResponse> lister(@AuthenticationPrincipal Jwt jwt,
                                             @RequestParam(value = "idUtilisateur", required = false) Integer idUtilisateurDemande) {
        int cible = resoudreUtilisateurCible(jwt, idUtilisateurDemande);
        return storage.lister(cible).stream()
                .map(e -> new FichierListeResponse(
                        e.cle(),
                        e.nomFichier(),
                        e.type() != null ? e.type().name() : null,
                        e.tailleOctets(),
                        e.dateDepot()))
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FichierDeposeResponse deposer(@AuthenticationPrincipal Jwt jwt,
                                         @RequestParam("file") MultipartFile fichier,
                                         @RequestParam(value = "type", required = false) TypePiece type) {
        if (fichier.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier vide");
        }
        int idUtilisateur = Integer.parseInt(jwt.getSubject());
        try {
            String cle = storage.deposer(
                    idUtilisateur,
                    fichier.getOriginalFilename(),
                    fichier.getContentType(),
                    fichier.getSize(),
                    fichier.getInputStream(),
                    type);
            return new FichierDeposeResponse(cle, fichier.getOriginalFilename(), fichier.getSize(),
                    type != null ? type.name() : null);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Echec de lecture du fichier uploade", e);
        }
    }

    /**
     * Stream le contenu d'une piece au client. JWT requis. Verifie d'abord
     * l'appartenance via le prefixe, puis re-stream depuis MinIO en mode
     * {@code inline} (le navigateur affiche PDF/image directement). Aucune URL
     * publique signee n'est emise : la requete passe systematiquement par cette
     * route, qui peut etre placee derriere un reverse proxy / auth_request
     * plus tard sans toucher au front.
     *
     * <p>Spring ferme l'{@link InputStreamResource} (donc la connexion MinIO)
     * apres serialisation.
     */
    @GetMapping("/contenu")
    public ResponseEntity<Resource> contenu(@AuthenticationPrincipal Jwt jwt,
                                            @RequestParam("cle") String cle) {
        if (cle == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        if (!estAgent(jwt)) {
            // Client : ne peut lire que sous SON prefixe. 404 (pas 403) : ne divulgue
            // pas l'existence des cles d'autres utilisateurs.
            int idUtilisateur = Integer.parseInt(jwt.getSubject());
            String prefixeAttendu = storage.prefixeUtilisateur(idUtilisateur);
            if (!cle.startsWith(prefixeAttendu)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            }
        }
        // Agent : aucun filtre - il peut lire n'importe quelle piece. La cle
        // suffit a tracer qui a lu quoi (logs HTTP), pas de fuite cross-user
        // possible (un client n'aura jamais une cle d'un autre client).
        Contenu contenu;
        try {
            contenu = storage.recuperer(cle);
        } catch (FichierIntrouvableException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        MediaType mediaType = contenu.contentType() != null && !contenu.contentType().isBlank()
                ? MediaType.parseMediaType(contenu.contentType())
                : MediaType.APPLICATION_OCTET_STREAM;
        // inline UNIQUEMENT pour les types qu'on a verifies comme inoffensifs.
        // Pour tout le reste, force le download (eviter XSS via HTML/SVG/JS).
        String typeNormalise = mediaType.getType() + "/" + mediaType.getSubtype();
        boolean inlinable = TYPES_AFFICHABLES_INLINE.contains(typeNormalise);
        ContentDisposition.Builder dispoBuilder = inlinable
                ? ContentDisposition.inline()
                : ContentDisposition.attachment();
        ContentDisposition disposition = dispoBuilder
                .filename(contenu.nomFichier() != null ? contenu.nomFichier() : "fichier", StandardCharsets.UTF_8)
                .build();
        ResponseEntity.BodyBuilder builder = ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                // Empeche le cache partage : si l'auth change, on ne veut pas
                // qu'un proxy resserve le fichier a quelqu'un d'autre.
                .cacheControl(org.springframework.http.CacheControl.noStore());
        if (contenu.tailleOctets() > 0) {
            builder.contentLength(contenu.tailleOctets());
        }
        return builder.body(new InputStreamResource(contenu.flux()));
    }

    /**
     * Vrai si le JWT porte le claim {@code type=agent} (= ROLE_AGENT cote
     * Spring Security, cf. JwtRoleConverter). Equivalent a injecter
     * {@code Authentication} et chercher l'authority, mais sans l'overhead.
     */
    private static boolean estAgent(Jwt jwt) {
        return "agent".equals(jwt.getClaimAsString("type"));
    }

    /**
     * Resout l'utilisateur cible d'un listing /fichiers selon le role :
     * - client : toujours son propre id, le parametre {@code idUtilisateur} est ignore.
     * - agent  : doit fournir {@code idUtilisateur} (400 sinon) ; permet au
     *   service client de consulter les pieces d'un usager identifie.
     */
    private static int resoudreUtilisateurCible(Jwt jwt, Integer idDemande) {
        if (!estAgent(jwt)) {
            return Integer.parseInt(jwt.getSubject());
        }
        if (idDemande == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Parametre idUtilisateur requis pour un agent");
        }
        return idDemande;
    }

    public record FichierDeposeResponse(String cle, String nomOriginal, long tailleOctets, String type) {
    }

    public record FichierListeResponse(String cle, String nomFichier, String type, long tailleOctets, Instant dateDepot) {
    }
}
