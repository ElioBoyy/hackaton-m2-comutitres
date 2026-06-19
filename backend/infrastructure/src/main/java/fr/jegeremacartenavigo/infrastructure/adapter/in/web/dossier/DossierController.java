package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandBus;
import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.dossier.ActiverDossierCommand;
import fr.jegeremacartenavigo.application.dossier.AjouterPieceCommand;
import fr.jegeremacartenavigo.application.dossier.ChangerStatutDossierCommand;
import fr.jegeremacartenavigo.application.dossier.CreerDossierCommand;
import fr.jegeremacartenavigo.application.dossier.RemplacerFichierPieceCommand;
import fr.jegeremacartenavigo.application.fichier.FichierStorage;
import fr.jegeremacartenavigo.application.fichier.TypePiece;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import fr.jegeremacartenavigo.application.dossier.DossierCountsResponse;
import fr.jegeremacartenavigo.application.dossier.DossierDetailResponse;
import fr.jegeremacartenavigo.application.dossier.DossierListResponse;
import fr.jegeremacartenavigo.application.dossier.DossierResponse;
import fr.jegeremacartenavigo.application.dossier.GetDossierCountsQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossierDetailQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossierHistoriqueQuery;
import fr.jegeremacartenavigo.application.dossier.GetDossiersQuery;
import fr.jegeremacartenavigo.application.dossier.EnregistrerPiecesCommand;
import fr.jegeremacartenavigo.application.dossier.ResilierDossierCommand;
import fr.jegeremacartenavigo.application.dossier.SoumettreEnVerificationCommand;
import fr.jegeremacartenavigo.application.dossier.SupprimerBrouillonCommand;
import fr.jegeremacartenavigo.application.dossier.StatutMisAJourResponse;
import fr.jegeremacartenavigo.domain.dossier.model.PieceADeposer;
import fr.jegeremacartenavigo.application.dossier.HistoriqueEntreeResponse;
import fr.jegeremacartenavigo.application.dossier.PieceJustificativeResponse;
import fr.jegeremacartenavigo.application.dossier.ValiderPieceCommand;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/dossiers")
public class DossierController {

    private final QueryBus queryBus;
    private final CommandBus commandBus;
    private final FichierStorage storage;
    private final DossierRepository dossierRepository;

    public DossierController(QueryBus queryBus, CommandBus commandBus,
                             FichierStorage storage, DossierRepository dossierRepository) {
        this.queryBus = queryBus;
        this.commandBus = commandBus;
        this.storage = storage;
        this.dossierRepository = dossierRepository;
    }

    @GetMapping
    public DossierListResponse list(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) String nomClient,
            @RequestParam(required = false) String numeroDossier,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        return queryBus.ask(new GetDossiersQuery(statut, nomClient, numeroDossier, page, pageSize));
    }

    @GetMapping("/counts")
    public DossierCountsResponse counts(
            @RequestParam(required = false) String nomClient,
            @RequestParam(required = false) String numeroDossier) {
        return queryBus.ask(new GetDossierCountsQuery(nomClient, numeroDossier));
    }

    @GetMapping("/{id}")
    public DossierDetailResponse detail(@PathVariable Integer id) {
        return queryBus.ask(new GetDossierDetailQuery(id));
    }

    @PostMapping
    public ResponseEntity<DossierResponse> creer(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestBody CreerDossierRequest body) {
        CreerDossierCommand command = new CreerDossierCommand(
                Integer.valueOf(jwt.getSubject()),
                body.idDossierExistant(),
                body.pourQui(),
                body.beneficiaireNomComplet(),
                body.situation(),
                body.situationPrecision(),
                body.boursier(),
                body.codeTypeAbonnement(),
                body.cheminPieceIdentite(),
                body.cheminCertificatScolarite(),
                body.cheminNotificationBourse(),
                body.modePaiement(),
                body.enAttentePaiement()
        );
        DossierResponse response = commandBus.send(command);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{id}/pieces")
    public StatutMisAJourResponse enregistrerPieces(@PathVariable Integer id,
                                                     @RequestBody(required = false) SoumettreRequest body) {
        List<PieceADeposer> pieces = body != null && body.pieces() != null
                ? body.pieces().stream()
                        .map(p -> new PieceADeposer(p.codeTypePiece(), p.cheminFichier()))
                        .toList()
                : List.of();
        return commandBus.send(new EnregistrerPiecesCommand(id, pieces));
    }

    @DeleteMapping("/{id}")
    public StatutMisAJourResponse supprimer(@PathVariable Integer id) {
        return commandBus.send(new SupprimerBrouillonCommand(id));
    }

    @PostMapping("/{id}/resilier")
    public StatutMisAJourResponse resilier(@PathVariable Integer id) {
        return commandBus.send(new ResilierDossierCommand(id));
    }

    /**
     * Marque le dossier comme pre-verifie par l'IA (action cote client). Le
     * porteur du dossier doit etre l'utilisateur connecte. Retourne le detail
     * actualise pour rafraichir l'UI cliente. L'agent verra ensuite le flag
     * dans son backoffice.
     */
    @PostMapping("/{id}/pre-verification-ia")
    public DossierDetailResponse preVerifierIA(@PathVariable Integer id,
                                                @AuthenticationPrincipal Jwt jwt) {
        try {
            dossierRepository.marquerPreVerifieParIA(id, Integer.valueOf(jwt.getSubject()));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, e.getMessage(), e);
        }
        return dossierRepository.findDetailById(id)
                .map(DossierDetailResponse::from)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Dossier introuvable"));
    }

    @PostMapping("/{id}/soumettre")
    public StatutMisAJourResponse soumettre(@PathVariable Integer id,
                                             @RequestBody(required = false) SoumettreRequest body) {
        List<PieceADeposer> pieces = body != null && body.pieces() != null
                ? body.pieces().stream()
                        .map(p -> new PieceADeposer(p.codeTypePiece(), p.cheminFichier()))
                        .toList()
                : List.of();
        return commandBus.send(new SoumettreEnVerificationCommand(id, pieces));
    }

    @GetMapping("/{id}/historique")
    public HistoriqueEntreeResponse.ListResponse historique(@PathVariable Integer id) {
        return queryBus.ask(new GetDossierHistoriqueQuery(id));
    }

    @PatchMapping("/{id}/pieces/{pieceId}")
    public PieceJustificativeResponse validerPiece(
            @PathVariable Integer id,
            @PathVariable Integer pieceId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ValiderPieceRequest body) {
        return commandBus.send(new ValiderPieceCommand(
                id, pieceId,
                Integer.valueOf(jwt.getSubject()),
                body.valider(),
                body.motifRejet()
        ));
    }

    /**
     * Change le statut du dossier (boutons "Valider/Rejeter le dossier" cote
     * backoffice). {@code codeStatut} doit etre un code du referentiel
     * (VALIDE / REJETE / INCOMPLET / ...). Reserve aux agents par la chaine
     * Security (matcher /dossiers/**).
     */
    @PatchMapping("/{id}/statut")
    public DossierDetailResponse changerStatut(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ChangerStatutRequest body) {
        return commandBus.send(new ChangerStatutDossierCommand(
                id,
                Integer.valueOf(jwt.getSubject()),
                body.codeStatut()
        ));
    }

    /**
     * Activation effective d'un dossier VALIDE : bouton "Activer l'abonnement"
     * du backoffice. L'agent choisit la date de debut, le backend calcule la
     * date de fin selon la periodicite et passe le statut a ACTIF.
     */
    @org.springframework.web.bind.annotation.PostMapping("/{id}/activer")
    public DossierDetailResponse activer(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody ActiverRequest body) {
        try {
            return commandBus.send(new ActiverDossierCommand(
                    id,
                    Integer.valueOf(jwt.getSubject()),
                    body.dateDebutDroits()
            ));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        }
    }

    /**
     * Ajout manuel d'une nouvelle piece sur un dossier instructible (action
     * agent). Le fichier est d'abord uploade sur MinIO sous le prefixe du
     * porteur, puis la commande cree la PieceJustificative en BDD avec le
     * cheminFichier resolu. {@code codeTypePiece} doit etre un code du
     * referentiel {@code type_piece_justificative}.
     *
     * <p>Si la pièce ne peut pas être ajoutée (dossier non instructible,
     * pièce du même type déjà presente), le repository leve {@code
     * IllegalStateException} traduit en 409.
     */
    @PostMapping("/{id}/pieces/upload")
    public PieceJustificativeResponse ajouterPiece(
            @PathVariable Integer id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("file") MultipartFile file,
            @RequestParam("codeTypePiece") String codeTypePiece) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier vide");
        }
        boolean parAgent = estAgent(jwt);
        int idAuteur = Integer.parseInt(jwt.getSubject());
        // Verification PREALABLE (ownership pour client + statut autorise) :
        // evite l'upload MinIO orphelin si l'autorisation echoue.
        int idPorteur = autoriserEdition(id, idAuteur, parAgent);
        String cheminFichier = uploaderFichier(idPorteur, file, codeTypePiece);
        try {
            return commandBus.send(new AjouterPieceCommand(
                    id, idAuteur, codeTypePiece, cheminFichier, parAgent
            ));
        } catch (IllegalStateException e) {
            // Doublon de type detecte par la commande : pas d'orphelin a nettoyer
            // (autorisation deja validee, l'upload reste lie a une piece...) - mais
            // ici la PieceJustificative n'a pas ete creee, donc l'objet MinIO est
            // bien orphelin. On le supprime pour eviter une accumulation.
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        }
    }

    /**
     * Remplacement du fichier d'une pièce existante. Endpoint partage entre
     * client et agent : le contrôleur deduit le role via le claim {@code type}
     * du JWT et passe le flag {@code parAgent} a la commande. Cote client, le
     * repository verifie aussi l'ownership et la fenetre de statuts autorises.
     */
    @PutMapping("/{id}/pieces/{pieceId}/fichier")
    public PieceJustificativeResponse remplacerFichierPiece(
            @PathVariable Integer id,
            @PathVariable Integer pieceId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fichier vide");
        }
        boolean parAgent = estAgent(jwt);
        int idAuteur = Integer.parseInt(jwt.getSubject());
        int idPorteur = autoriserEdition(id, idAuteur, parAgent);
        // codeTypePiece null : on stocke en upload generique. Le type metier
        // est porte par la PieceJustificative en BDD, pas par la cle MinIO.
        String cheminFichier = uploaderFichier(idPorteur, file, null);
        try {
            return commandBus.send(new RemplacerFichierPieceCommand(
                    id, pieceId, idAuteur, cheminFichier, parAgent
            ));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        }
    }

    /**
     * Verifie en lecture (READ_COMMITTED) que l'auteur peut editer le dossier
     * (statut instructible + ownership cote client). Retourne l'id du porteur,
     * indispensable pour scope-er le prefixe MinIO de l'upload qui suit. Les
     * exceptions metier ({@code DossierIntrouvableException},
     * {@code IllegalStateException}) sont traduites en 404/409 par le
     * GlobalExceptionHandler en place.
     */
    private int autoriserEdition(Integer idDossier, int idAuteur, boolean parAgent) {
        try {
            return dossierRepository.verifierEditable(idDossier, idAuteur, parAgent);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage(), e);
        }
    }

    private static boolean estAgent(Jwt jwt) {
        return "agent".equals(jwt.getClaimAsString("type"));
    }

    private String uploaderFichier(int idPorteur, MultipartFile file, String codeTypePiece) {
        TypePiece type;
        try {
            type = codeTypePiece != null ? TypePiece.valueOf(codeTypePiece) : null;
        } catch (IllegalArgumentException ignore) {
            // Type metier inconnu cote MinIO -> on stocke en upload generique.
            type = null;
        }
        try {
            return storage.deposer(
                    idPorteur,
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getSize(),
                    file.getInputStream(),
                    type);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Echec de lecture du fichier uploade", e);
        }
    }
}
