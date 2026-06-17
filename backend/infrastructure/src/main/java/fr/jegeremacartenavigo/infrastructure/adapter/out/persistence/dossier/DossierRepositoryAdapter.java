package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierDejaFinaliseException;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.exception.ReferentielIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.model.DemandePour;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.ModePaiementDossier;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.dossier.model.Personne;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.UtilisateurJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement.Paiement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement.PaiementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificative;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificativeJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter JPA implementant le port domaine {@link DossierRepository}. Cree
 * ou complete (si {@code idDossierExistant} est fourni - evite les
 * doublons) en une seule transaction le {@code Dossier}, ses
 * {@code PieceJustificative} et, si un moyen de paiement est fourni, son
 * {@code Paiement} (mock, toujours immediatement "valide" - cf. CONTEXT.md /
 * decision sur les donnees de paiement sensibles : aucun IBAN ni numero de
 * carte n'est jamais recu ni stocke ici). Sans moyen de paiement (bouton
 * "Sauvegarder et quitter"), le dossier est cree/maintenu en brouillon,
 * statut {@code EN_ATTENTE_PAIEMENT}, sans Paiement.
 *
 * <p>{@code utilisateurPorteur} et {@code utilisateurPayeur} sont toujours
 * l'utilisateur connecte, meme pour une {@code DemandePour.TIERS} (cf.
 * decision DemandePour : le tiers n'est qu'un nom en texte libre).
 *
 * <p>Mapping entre les entites JPA (Dossier, PieceJustificative...) et les
 * records domaine (DossierResume, DossierDetail).
 */
@Component
public class DossierRepositoryAdapter implements DossierRepository {
    private final DossierJpaRepository dossierJpa;
    private final PieceJustificativeJpaRepository pieceJpa;

    public DossierRepositoryAdapter(DossierJpaRepository dossierJpa,
                                     PieceJustificativeJpaRepository pieceJpa) {
        this.dossierJpa = dossierJpa;
        this.pieceJpa = pieceJpa;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<DossierResume> findPage(String categorieStatut, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("dateCreation").descending());

        Page<Dossier> resultat = categorieStatut == null
                ? dossierJpa.findAll(pageRequest)
                : dossierJpa.findByStatutActuel_Categorie(
                        StatutDossier.Categorie.valueOf(categorieStatut), pageRequest);

        List<Integer> idsDossier = resultat.getContent().stream().map(Dossier::getIdDossier).toList();
        Map<Integer, Long> nbPiecesEnAttenteParDossier = idsDossier.isEmpty()
                ? Map.of()
                : pieceJpa.countByStatutGroupByDossier(PieceJustificative.StatutValidation.en_attente, idsDossier)
                    .stream()
                    .collect(Collectors.toMap(
                            PieceJustificativeJpaRepository.NbPiecesEnAttenteParDossier::getIdDossier,
                            PieceJustificativeJpaRepository.NbPiecesEnAttenteParDossier::getTotal));

        List<DossierResume> dossiers = resultat.getContent().stream()
                .map(d -> toResume(d, nbPiecesEnAttenteParDossier.getOrDefault(d.getIdDossier(), 0L)))
                .toList();

        return new PageResult<>(dossiers, page, pageSize, resultat.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DossierDetail> findDetailById(Integer id) {
        return dossierJpa.findById(id).map(this::toDetail);
    }

    private static DossierResume toResume(Dossier d, long nbPiecesEnAttente) {
        return new DossierResume(
                d.getIdDossier(),
                nomComplet(d.getUtilisateurPorteur()),
                d.getTypeAbonnement().getCode(),
                d.getTypeAbonnement().getLibelle(),
                d.getStatutActuel().getCode(),
                d.getStatutActuel().getLibelle(),
                d.getStatutActuel().getCategorie().name(),
                nbPiecesEnAttente,
                d.getDateCreation()
        );
    }

    private DossierDetail toDetail(Dossier d) {
        List<PieceJustificativeResume> pieces = pieceJpa
                .findByDossier_IdDossierOrderByDateDepotDesc(d.getIdDossier())
                .stream()
                .map(DossierRepositoryAdapter::toPieceResume)
                .toList();

        return new DossierDetail(
                d.getIdDossier(),
                toPersonne(d.getUtilisateurPorteur()),
                toPersonne(d.getUtilisateurPayeur()),
                d.getTypeAbonnement().getCode(),
                d.getTypeAbonnement().getLibelle(),
                d.getStatutActuel().getCode(),
                d.getStatutActuel().getLibelle(),
                d.getStatutActuel().getCategorie().name(),
                d.getDateCreation(),
                d.getDateDebutDroits(),
                d.getDateFinDroits(),
                d.getMontantTotal(),
                pieces
        );
    }

    private static PieceJustificativeResume toPieceResume(PieceJustificative p) {
        return new PieceJustificativeResume(
                p.getIdPiece(),
                p.getTypePiece().getLibelle(),
                p.getStatutValidation().name(),
                p.getDateDepot(),
                p.getMotifRejet()
        );
    }

    private static Personne toPersonne(Utilisateur u) {
        return new Personne(u.getIdUtilisateur(), u.getNom(), u.getPrenom(), u.getEmail());
    }

    private static String nomComplet(Utilisateur u) {
        return u.getPrenom() + " " + u.getNom();
      
      
      
    private static final String STATUT_ACTIF = "ACTIF";
    private static final String STATUT_BROUILLON = "EN_ATTENTE_PAIEMENT";
    private static final String CODE_PIECE_IDENTITE = "PIECE_IDENTITE";
    private static final String CODE_CERTIFICAT_SCOLARITE = "CERTIFICAT_SCOLARITE";
    private static final String CODE_NOTIFICATION_BOURSE = "NOTIFICATION_BOURSE";

    private final DossierJpaRepository dossierJpaRepository;
    private final UtilisateurJpaRepository utilisateurJpaRepository;
    private final TypeAbonnementJpaRepository typeAbonnementJpaRepository;
    private final StatutDossierJpaRepository statutDossierJpaRepository;
    private final TypePieceJustificativeJpaRepository typePieceJpaRepository;
    private final PieceJustificativeJpaRepository pieceJustificativeJpaRepository;
    private final PaiementJpaRepository paiementJpaRepository;

    public DossierRepositoryAdapter(
            DossierJpaRepository dossierJpaRepository,
            UtilisateurJpaRepository utilisateurJpaRepository,
            TypeAbonnementJpaRepository typeAbonnementJpaRepository,
            StatutDossierJpaRepository statutDossierJpaRepository,
            TypePieceJustificativeJpaRepository typePieceJpaRepository,
            PieceJustificativeJpaRepository pieceJustificativeJpaRepository,
            PaiementJpaRepository paiementJpaRepository
    ) {
        this.dossierJpaRepository = dossierJpaRepository;
        this.utilisateurJpaRepository = utilisateurJpaRepository;
        this.typeAbonnementJpaRepository = typeAbonnementJpaRepository;
        this.statutDossierJpaRepository = statutDossierJpaRepository;
        this.typePieceJpaRepository = typePieceJpaRepository;
        this.pieceJustificativeJpaRepository = pieceJustificativeJpaRepository;
        this.paiementJpaRepository = paiementJpaRepository;
    }

    @Override
    @Transactional
    public DossierCree enregistrer(NouveauDossier nouveauDossier) {
        Utilisateur connecte = utilisateurJpaRepository.findById(nouveauDossier.idUtilisateurConnecte())
                .orElseThrow(UtilisateurIntrouvableException::new);

        TypeAbonnement typeAbonnement = typeAbonnementJpaRepository.findByCode(nouveauDossier.codeTypeAbonnement())
                .filter(TypeAbonnement::isActif)
                .orElseThrow(() -> new ReferentielIntrouvableException(
                        "Type d'abonnement introuvable ou inactif : " + nouveauDossier.codeTypeAbonnement()));

        boolean paiementFourni = nouveauDossier.modePaiement() != null;
        String codeStatut = paiementFourni ? STATUT_ACTIF : STATUT_BROUILLON;
        StatutDossier statut = statutDossierJpaRepository.findByCode(codeStatut)
                .orElseThrow(() -> new ReferentielIntrouvableException(
                        "Statut de dossier introuvable : " + codeStatut));

        Dossier dossier = resoudreDossier(nouveauDossier, connecte);
        appliquerChamps(dossier, nouveauDossier, connecte, typeAbonnement, statut, paiementFourni);
        dossierJpaRepository.save(dossier);

        enregistrerOuRemplacerPiece(dossier, connecte, CODE_PIECE_IDENTITE, nouveauDossier.cheminPieceIdentite());
        enregistrerOuRemplacerPiece(dossier, connecte, CODE_CERTIFICAT_SCOLARITE, nouveauDossier.cheminCertificatScolarite());
        enregistrerOuRemplacerPiece(dossier, connecte, CODE_NOTIFICATION_BOURSE, nouveauDossier.cheminNotificationBourse());

        if (paiementFourni) {
            enregistrerPaiement(dossier, connecte, nouveauDossier.modePaiement());
        }

        return new DossierCree(
                dossier.getIdDossier(),
                statut.getCode(),
                dossier.getMontantTotal(),
                nouveauDossier.modePaiement(),
                dossier.getDateCreation()
        );
    }

    // idDossierExistant present : on complete un brouillon deja sauvegarde
    // (evite les doublons quand l'usager revient payer plus tard). Sinon,
    // nouveau Dossier vierge.
    private Dossier resoudreDossier(NouveauDossier nouveauDossier, Utilisateur connecte) {
        if (nouveauDossier.idDossierExistant() == null) {
            return new Dossier();
        }
        Dossier existant = dossierJpaRepository.findById(nouveauDossier.idDossierExistant())
                .orElseThrow(DossierIntrouvableException::new);
        if (!existant.getUtilisateurPorteur().getIdUtilisateur().equals(connecte.getIdUtilisateur())) {
            // Meme erreur que "introuvable" : ne pas reveler l'existence du
            // dossier d'un autre utilisateur.
            throw new DossierIntrouvableException();
        }
        if (!STATUT_BROUILLON.equals(existant.getStatutActuel().getCode())) {
            throw new DossierDejaFinaliseException();
        }
        return existant;
    }

    private void appliquerChamps(Dossier dossier, NouveauDossier nouveauDossier, Utilisateur connecte,
                                  TypeAbonnement typeAbonnement, StatutDossier statut, boolean paiementFourni) {
        boolean nouveauDossierVierge = dossier.getIdDossier() == null;
        dossier.setUtilisateurPorteur(connecte);
        dossier.setUtilisateurPayeur(connecte);
        dossier.setTypeAbonnement(typeAbonnement);
        dossier.setStatutActuel(statut);
        if (nouveauDossierVierge) {
            dossier.setCanalCreation(Dossier.CanalCreation.en_ligne);
            dossier.setDateCreation(LocalDateTime.now());
            dossier.setDateDebutDroits(LocalDate.now());
        }
        if (paiementFourni) {
            LocalDate debutDroits = dossier.getDateDebutDroits() != null ? dossier.getDateDebutDroits() : LocalDate.now();
            dossier.setDateFinDroits(debutDroits.plusYears(1));
        }
        dossier.setMontantTotal(typeAbonnement.getTarifPlein() != null ? typeAbonnement.getTarifPlein() : BigDecimal.ZERO);
        dossier.setPeriodicitePaiement(mapPeriodicite(typeAbonnement.getPeriodicite()));
        dossier.setSituationCode(nouveauDossier.situation().name());
        dossier.setSituationPrecision(nouveauDossier.situationPrecision());
        dossier.setBoursier(nouveauDossier.boursier());
        dossier.setBeneficiaireNomComplet(
                nouveauDossier.demandePour() == DemandePour.TIERS ? nouveauDossier.beneficiaireNomComplet() : null);
    }

    private Dossier.PeriodicitePaiement mapPeriodicite(TypeAbonnement.Periodicite periodicite) {
        return switch (periodicite) {
            case annuelle -> Dossier.PeriodicitePaiement.annuel;
            case mensuelle -> Dossier.PeriodicitePaiement.mensuel;
            default -> Dossier.PeriodicitePaiement.ponctuel;
        };
    }

    // Remplace la piece existante du meme type sur ce dossier si on
    // complete un brouillon (idDossierExistant), au lieu de la dupliquer.
    private void enregistrerOuRemplacerPiece(Dossier dossier, Utilisateur depositaire, String codeTypePiece, String cheminFichier) {
        if (cheminFichier == null || cheminFichier.isBlank()) {
            return;
        }
        TypePieceJustificative typePiece = typePieceJpaRepository.findByCode(codeTypePiece)
                .orElseThrow(() -> new ReferentielIntrouvableException("Type de piece introuvable : " + codeTypePiece));

        PieceJustificative piece = dossier.getIdDossier() == null
                ? null
                : pieceJustificativeJpaRepository
                        .findByDossier_IdDossierAndTypePiece_IdTypePiece(dossier.getIdDossier(), typePiece.getIdTypePiece())
                        .orElse(null);
        if (piece == null) {
            piece = new PieceJustificative();
            piece.setDossier(dossier);
            piece.setTypePiece(typePiece);
        }
        piece.setUtilisateurDepot(depositaire);
        piece.setCheminFichier(cheminFichier);
        piece.setDateDepot(LocalDateTime.now());
        pieceJustificativeJpaRepository.save(piece);
    }

    private void enregistrerPaiement(Dossier dossier, Utilisateur payeur, ModePaiementDossier modePaiementDossier) {
        Paiement paiement = new Paiement();
        paiement.setDossier(dossier);
        paiement.setUtilisateurPayeur(payeur);
        paiement.setTypePaiement(Paiement.TypePaiement.paiement_initial);
        paiement.setMontant(dossier.getMontantTotal());
        paiement.setDatePaiement(LocalDateTime.now());
        paiement.setModePaiement(modePaiementDossier == ModePaiementDossier.SEPA
                ? Paiement.ModePaiement.prelevement_sepa
                : Paiement.ModePaiement.CB);
        paiement.setReferenceTransaction("MOCK-" + UUID.randomUUID());
        paiement.setStatut(Paiement.Statut.valide);
        paiementJpaRepository.save(paiement);
      
    }
}
