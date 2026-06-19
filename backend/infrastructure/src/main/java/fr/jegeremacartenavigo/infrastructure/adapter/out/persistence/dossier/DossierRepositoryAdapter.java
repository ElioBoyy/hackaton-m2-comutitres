package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierDejaFinaliseException;
import fr.jegeremacartenavigo.domain.dossier.exception.DossierIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.exception.ReferentielIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.exception.PieceIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.model.CodeStatutDossier;
import fr.jegeremacartenavigo.domain.dossier.model.DemandePour;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.HistoriqueEntree;
import fr.jegeremacartenavigo.domain.dossier.model.ModePaiementDossier;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;
import fr.jegeremacartenavigo.domain.dossier.model.PieceADeposer;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.dossier.model.Personne;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;
import fr.jegeremacartenavigo.domain.dossier.model.PieceRequiseResume;
import fr.jegeremacartenavigo.domain.dossier.model.ValidationPiece;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.AgentJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.HistoriqueDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.HistoriqueDossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.UtilisateurJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement.Paiement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement.PaiementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.PieceRequise;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.PieceRequiseJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificative;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificativeJpaRepository;
import jakarta.persistence.EntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class DossierRepositoryAdapter implements DossierRepository {

    private static final String STATUT_EN_VERIFICATION = CodeStatutDossier.EN_VERIFICATION.name();
    private static final String STATUT_EN_ATTENTE_PAIEMENT = CodeStatutDossier.EN_ATTENTE_PAIEMENT.name();
    private static final String STATUT_BROUILLON = CodeStatutDossier.BROUILLON.name();
    private static final String CODE_PIECE_IDENTITE = "PIECE_IDENTITE";
    private static final String CODE_CERTIFICAT_SCOLARITE = "CERTIFICAT_SCOLARITE";
    private static final String CODE_NOTIFICATION_BOURSE = "NOTIFICATION_BOURSE";

    private final DossierJpaRepository dossierJpa;
    private final PieceJustificativeJpaRepository pieceJpa;
    private final UtilisateurJpaRepository utilisateurJpaRepository;
    private final TypeAbonnementJpaRepository typeAbonnementJpaRepository;
    private final StatutDossierJpaRepository statutDossierJpaRepository;
    private final TypePieceJustificativeJpaRepository typePieceJpaRepository;
    private final PaiementJpaRepository paiementJpaRepository;
    private final HistoriqueDossierJpaRepository historiqueJpa;
    private final AgentJpaRepository agentJpaRepository;
    private final SequenceAnnuelleDossierJpaRepository sequenceJpa;
    private final PieceRequiseJpaRepository pieceRequiseJpa;
    private final EntityManager em;

    public DossierRepositoryAdapter(
            DossierJpaRepository dossierJpa,
            PieceJustificativeJpaRepository pieceJpa,
            UtilisateurJpaRepository utilisateurJpaRepository,
            TypeAbonnementJpaRepository typeAbonnementJpaRepository,
            StatutDossierJpaRepository statutDossierJpaRepository,
            TypePieceJustificativeJpaRepository typePieceJpaRepository,
            PaiementJpaRepository paiementJpaRepository,
            HistoriqueDossierJpaRepository historiqueJpa,
            AgentJpaRepository agentJpaRepository,
            SequenceAnnuelleDossierJpaRepository sequenceJpa,
            PieceRequiseJpaRepository pieceRequiseJpa,
            EntityManager em) {
        this.dossierJpa = dossierJpa;
        this.pieceJpa = pieceJpa;
        this.utilisateurJpaRepository = utilisateurJpaRepository;
        this.typeAbonnementJpaRepository = typeAbonnementJpaRepository;
        this.statutDossierJpaRepository = statutDossierJpaRepository;
        this.typePieceJpaRepository = typePieceJpaRepository;
        this.paiementJpaRepository = paiementJpaRepository;
        this.historiqueJpa = historiqueJpa;
        this.agentJpaRepository = agentJpaRepository;
        this.sequenceJpa = sequenceJpa;
        this.pieceRequiseJpa = pieceRequiseJpa;
        this.em = em;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<DossierResume> findPage(String categorieStatut, String nomClient, String numeroDossier, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("dateCreation").descending());
        StatutDossier.Categorie categorie = categorieStatut == null ? null : StatutDossier.Categorie.valueOf(categorieStatut);

        Page<Dossier> resultat;
        if (nomClient != null && !nomClient.isBlank()) {
            resultat = categorie == null
                    ? dossierJpa.findByNomClient(nomClient.trim(), pageRequest)
                    : dossierJpa.findByNomClientAndCategorie(categorie, nomClient.trim(), pageRequest);
        } else if (numeroDossier != null && !numeroDossier.isBlank()) {
            resultat = categorie == null
                    ? dossierJpa.findByNumeroDossier(numeroDossier.trim(), pageRequest)
                    : dossierJpa.findByNumeroDossierAndCategorie(categorie, numeroDossier.trim(), pageRequest);
        } else {
            resultat = categorie == null
                    ? dossierJpa.findAllExceptBrouillon(pageRequest)
                    : dossierJpa.findByCategorieExceptBrouillon(categorie, pageRequest);
        }

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
    public Map<String, Long> countByCategorie() {
        return countByCategorie(null, null);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> countByCategorie(String nomClient, String numeroDossier) {
        List<Object[]> rows;
        if (nomClient != null && !nomClient.isBlank()) {
            rows = dossierJpa.countByNomClientGroupByCategorie(nomClient.trim());
        } else if (numeroDossier != null && !numeroDossier.isBlank()) {
            rows = dossierJpa.countByNumeroDossierGroupByCategorie(numeroDossier.trim());
        } else {
            rows = dossierJpa.countGroupByCategorie();
        }
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : rows) {
            StatutDossier.Categorie categorie = (StatutDossier.Categorie) row[0];
            Long count = (Long) row[1];
            result.put(categorie.name(), count);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DossierDetail> findDetailById(Integer id) {
        return dossierJpa.findById(id).map(this::toDetail);
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
        String codeStatut = paiementFourni ? STATUT_EN_VERIFICATION
                : Boolean.TRUE.equals(nouveauDossier.enAttentePaiement()) ? STATUT_EN_ATTENTE_PAIEMENT
                : STATUT_BROUILLON;
        StatutDossier statut = statutDossierJpaRepository.findByCode(codeStatut)
                .orElseThrow(() -> new ReferentielIntrouvableException(
                        "Statut de dossier introuvable : " + codeStatut));

        Dossier dossier = resoudreDossier(nouveauDossier, connecte);
        appliquerChamps(dossier, nouveauDossier, connecte, typeAbonnement, statut, paiementFourni);
        if (dossier.getNumeroDossier() == null) {
            dossier.setNumeroDossier(genererNumeroDossier());
        }
        dossierJpa.save(dossier);

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

    private Dossier resoudreDossier(NouveauDossier nouveauDossier, Utilisateur connecte) {
        if (nouveauDossier.idDossierExistant() == null) {
            return new Dossier();
        }
        Dossier existant = dossierJpa.findById(nouveauDossier.idDossierExistant())
                .orElseThrow(() -> new DossierIntrouvableException(nouveauDossier.idDossierExistant()));
        if (!existant.getUtilisateurPorteur().getIdUtilisateur().equals(connecte.getIdUtilisateur())) {
            throw new DossierIntrouvableException(nouveauDossier.idDossierExistant());
        }
        String codeActuel = existant.getStatutActuel().getCode();
        if (!STATUT_BROUILLON.equals(codeActuel) && !STATUT_EN_ATTENTE_PAIEMENT.equals(codeActuel)) {
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

    private void enregistrerOuRemplacerPiece(Dossier dossier, Utilisateur depositaire,
                                              String codeTypePiece, String cheminFichier) {
        if (cheminFichier == null || cheminFichier.isBlank()) {
            return;
        }
        TypePieceJustificative typePiece = typePieceJpaRepository.findByCode(codeTypePiece)
                .orElseThrow(() -> new ReferentielIntrouvableException("Type de piece introuvable : " + codeTypePiece));

        PieceJustificative piece = dossier.getIdDossier() == null
                ? null
                : pieceJpa.findByDossier_IdDossierAndTypePiece_IdTypePiece(
                        dossier.getIdDossier(), typePiece.getIdTypePiece()).orElse(null);
        if (piece == null) {
            piece = new PieceJustificative();
            piece.setDossier(dossier);
            piece.setTypePiece(typePiece);
        }
        piece.setUtilisateurDepot(depositaire);
        piece.setCheminFichier(cheminFichier);
        piece.setDateDepot(LocalDateTime.now());
        pieceJpa.save(piece);
    }

    private void enregistrerPaiement(Dossier dossier, Utilisateur payeur,
                                      ModePaiementDossier modePaiementDossier) {
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

    @Override
    @Transactional
    public void resilier(Integer id) {
        Dossier dossier = dossierJpa.findById(id)
                .orElseThrow(() -> new DossierIntrouvableException(id));
        StatutDossier statut = statutDossierJpaRepository.findByCode("RESILIE")
                .orElseThrow(() -> new ReferentielIntrouvableException("Statut RESILIE introuvable"));
        dossier.setStatutActuel(statut);
        dossierJpa.save(dossier);
    }

    @Override
    @Transactional
    public void soumettre(Integer id) {
        Dossier dossier = dossierJpa.findById(id)
                .orElseThrow(() -> new DossierIntrouvableException(id));
        StatutDossier statut = statutDossierJpaRepository.findByCode("EN_VERIFICATION")
                .orElseThrow(() -> new ReferentielIntrouvableException("Statut EN_VERIFICATION introuvable"));
        dossier.setStatutActuel(statut);
        dossierJpa.save(dossier);
    }

    @Override
    @Transactional
    public void ajouterOuRemplacerPieces(Integer idDossier, java.util.List<PieceADeposer> pieces) {
        Dossier dossier = dossierJpa.findById(idDossier)
                .orElseThrow(() -> new DossierIntrouvableException(idDossier));
        Utilisateur depositaire = dossier.getUtilisateurPorteur();
        for (PieceADeposer piece : pieces) {
            enregistrerOuRemplacerPiece(dossier, depositaire, piece.codeTypePiece(), piece.cheminFichier());
        }
    }

    @Override
    @Transactional
    public void supprimer(Integer id) {
        if (!dossierJpa.existsById(id)) throw new DossierIntrouvableException(id);
        // Nullifier les FK optionnelles avant suppression pour éviter la violation de contrainte
        em.createNativeQuery("UPDATE utilisateur_situation SET id_dossier_justificatif = NULL WHERE id_dossier_justificatif = :id")
                .setParameter("id", id).executeUpdate();
        em.createNativeQuery("UPDATE notification SET id_dossier = NULL WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
        // Supprimer les entités dépendantes dans l'ordre (respect des FK NOT NULL)
        em.createNativeQuery("DELETE FROM commentaire_echange WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
        em.createNativeQuery("DELETE FROM historique_dossier WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
        em.createNativeQuery("DELETE FROM piece_justificative WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
        em.createNativeQuery("DELETE FROM paiement WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
        em.createNativeQuery("DELETE FROM remboursement_aide WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
        em.createNativeQuery("DELETE FROM dossier WHERE id_dossier = :id")
                .setParameter("id", id).executeUpdate();
    }

    private static DossierResume toResume(Dossier d, long nbPiecesEnAttente) {
        return new DossierResume(
                d.getIdDossier(),
                d.getNumeroDossier(),
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

        List<PieceRequiseResume> piecesRequises = pieceRequiseJpa
                .findByTypeAbonnement_Code(d.getTypeAbonnement().getCode())
                .stream()
                .map(pr -> new PieceRequiseResume(
                        pr.getTypePiece().getCode(),
                        pr.getTypePiece().getLibelle(),
                        pr.isObligatoire()))
                .toList();

        return new DossierDetail(
                d.getIdDossier(),
                d.getNumeroDossier(),
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
                pieces,
                piecesRequises
        );
    }

    @Override
    @Transactional
    public PieceJustificativeResume ajouterPiece(Integer idDossier, Integer idAuteur,
                                                  String codeTypePiece, String cheminFichier,
                                                  boolean parAgent) {
        Dossier dossier = chargerDossierEditable(idDossier, idAuteur, parAgent);
        TypePieceJustificative typePiece = typePieceJpaRepository.findByCode(codeTypePiece)
                .orElseThrow(() -> new ReferentielIntrouvableException("Type de piece introuvable : " + codeTypePiece));
        // Une seule piece par couple (dossier, typePiece) : si elle existe deja,
        // l'appelant doit passer par "Remplacer".
        if (pieceJpa.findByDossier_IdDossierAndTypePiece_IdTypePiece(idDossier, typePiece.getIdTypePiece()).isPresent()) {
            throw new IllegalStateException("Une piece de type " + codeTypePiece + " existe deja sur ce dossier.");
        }

        PieceJustificative piece = new PieceJustificative();
        piece.setDossier(dossier);
        piece.setTypePiece(typePiece);
        piece.setUtilisateurDepot(dossier.getUtilisateurPorteur());
        piece.setCheminFichier(cheminFichier);
        piece.setDateDepot(LocalDateTime.now());
        piece.setStatutValidation(PieceJustificative.StatutValidation.en_attente);
        piece.setModifieParAgent(parAgent);
        pieceJpa.save(piece);

        enregistrerHistoriqueDepot(dossier, idAuteur, parAgent,
                (parAgent ? "Pièce ajoutée par l'agent : " : "Pièce ajoutée : ") + typePiece.getLibelle());
        return toPieceResume(piece);
    }

    @Override
    @Transactional
    public PieceJustificativeResume remplacerFichierPiece(Integer idDossier, Integer idPiece,
                                                          Integer idAuteur, String cheminFichier,
                                                          boolean parAgent) {
        Dossier dossier = chargerDossierEditable(idDossier, idAuteur, parAgent);
        PieceJustificative piece = pieceJpa.findById(idPiece)
                .filter(p -> p.getDossier().getIdDossier().equals(idDossier))
                .orElseThrow(() -> new PieceIntrouvableException(idPiece));

        // Reset complet : la piece redevient un nouveau depot a examiner. Le
        // flag IA est aussi reset : le nouveau contenu n'a pas ete vu par l'IA.
        piece.setCheminFichier(cheminFichier);
        piece.setDateDepot(LocalDateTime.now());
        piece.setStatutValidation(PieceJustificative.StatutValidation.en_attente);
        piece.setAgentValidation(null);
        piece.setDateValidation(null);
        piece.setMotifRejet(null);
        piece.setModifieParAgent(parAgent);
        piece.setVerifieParIA(false);
        pieceJpa.save(piece);

        enregistrerHistoriqueDepot(dossier, idAuteur, parAgent,
                (parAgent ? "Pièce remplacée par l'agent : " : "Pièce remplacée : ") + piece.getTypePiece().getLibelle());
        return toPieceResume(piece);
    }

    @Override
    @Transactional(readOnly = true)
    public Integer verifierEditable(Integer idDossier, Integer idAuteur, boolean parAgent) {
        Dossier dossier = chargerDossierEditable(idDossier, idAuteur, parAgent);
        return dossier.getUtilisateurPorteur().getIdUtilisateur();
    }

    /**
     * Charge un dossier editable. La fenetre de statuts depend de qui agit :
     * - agent backoffice : EN_VERIFICATION ou INCOMPLET (le dossier est en cours
     *   d'instruction par le service)
     * - client : BROUILLON / EN_ATTENTE_PAIEMENT / INCOMPLET (le client est libre
     *   de modifier ses pieces tant qu'aucune action backoffice n'est en cours)
     *
     * <p>Pour un client, verifie aussi que {@code idAuteur} est bien le porteur
     * du dossier (404-like via DossierIntrouvableException pour ne pas leaker
     * l'existence du dossier).
     */
    private Dossier chargerDossierEditable(Integer idDossier, Integer idAuteur, boolean parAgent) {
        Dossier dossier = dossierJpa.findById(idDossier)
                .orElseThrow(() -> new DossierIntrouvableException(idDossier));
        String code = dossier.getStatutActuel().getCode();
        if (parAgent) {
            boolean instructible = CodeStatutDossier.EN_VERIFICATION.name().equals(code)
                    || CodeStatutDossier.INCOMPLET.name().equals(code);
            if (!instructible) {
                throw new IllegalStateException("Dossier non instructible (statut actuel : " + code + ")");
            }
        } else {
            if (!dossier.getUtilisateurPorteur().getIdUtilisateur().equals(idAuteur)) {
                throw new DossierIntrouvableException(idDossier);
            }
            boolean editableParClient = CodeStatutDossier.BROUILLON.name().equals(code)
                    || CodeStatutDossier.EN_ATTENTE_PAIEMENT.name().equals(code)
                    || CodeStatutDossier.INCOMPLET.name().equals(code);
            if (!editableParClient) {
                throw new IllegalStateException("Dossier non modifiable au statut " + code);
            }
        }
        return dossier;
    }

    @Override
    @Transactional
    public void activerDossier(Integer idDossier, Integer idAgent, LocalDate dateDebutDroits) {
        Dossier dossier = dossierJpa.findById(idDossier)
                .orElseThrow(() -> new DossierIntrouvableException(idDossier));
        Agent agent = agentJpaRepository.findById(idAgent)
                .orElseThrow(() -> new ReferentielIntrouvableException("Agent introuvable : " + idAgent));
        if (!CodeStatutDossier.VALIDE.name().equals(dossier.getStatutActuel().getCode())) {
            throw new IllegalStateException("Le dossier doit etre VALIDE pour etre active (statut actuel : "
                    + dossier.getStatutActuel().getCode() + ").");
        }
        if (dateDebutDroits == null) {
            throw new IllegalStateException("dateDebutDroits requise pour activer le dossier.");
        }

        LocalDate dateFinDroits = calculerDateFinDroits(dossier.getTypeAbonnement().getPeriodicite(), dateDebutDroits);
        dossier.setDateDebutDroits(dateDebutDroits);
        dossier.setDateFinDroits(dateFinDroits);
        dossierJpa.save(dossier);

        appliquerChangementStatut(dossier, CodeStatutDossier.ACTIF, agent,
                "Abonnement activé : droits du " + dateDebutDroits
                        + (dateFinDroits != null ? " au " + dateFinDroits : " (sans terme)") + ".");
    }

    @Override
    @Transactional
    public void marquerPreVerifieParIA(Integer idDossier, Integer idUtilisateur) {
        Dossier dossier = dossierJpa.findById(idDossier)
                .orElseThrow(() -> new DossierIntrouvableException(idDossier));
        if (!dossier.getUtilisateurPorteur().getIdUtilisateur().equals(idUtilisateur)) {
            throw new IllegalStateException("Seul le porteur du dossier peut lancer la pre-verification IA.");
        }
        // Marque toutes les pieces non rejetees comme pre-verifiees. Les pieces
        // rejetees gardent leur flag intact (et ne sont pas re-verifiees tant
        // qu'elles n'ont pas ete remplacees).
        List<PieceJustificative> pieces = pieceJpa.findByDossier_IdDossierOrderByDateDepotDesc(idDossier);
        for (PieceJustificative piece : pieces) {
            if (piece.getStatutValidation() == PieceJustificative.StatutValidation.rejetee) continue;
            if (piece.isVerifieParIA()) continue;
            piece.setVerifieParIA(true);
            pieceJpa.save(piece);
        }
    }

    private static LocalDate calculerDateFinDroits(TypeAbonnement.Periodicite periodicite, LocalDate debut) {
        if (periodicite == null) return null;
        return switch (periodicite) {
            case journaliere -> debut.plusDays(1);
            case hebdomadaire -> debut.plusWeeks(1);
            case mensuelle -> debut.plusMonths(1);
            case annuelle -> debut.plusYears(1);
            case sans_abonnement -> null;
        };
    }

    private void enregistrerHistoriqueDepot(Dossier dossier, Integer idAuteur,
                                             boolean parAgent, String description) {
        HistoriqueDossier entree = new HistoriqueDossier();
        entree.setDossier(dossier);
        entree.setDateAction(LocalDateTime.now());
        entree.setTypeAction(HistoriqueDossier.TypeAction.depot_piece);
        if (parAgent) {
            entree.setAgent(agentJpaRepository.findById(idAuteur)
                    .orElseThrow(() -> new ReferentielIntrouvableException("Agent introuvable : " + idAuteur)));
        } else {
            entree.setUtilisateur(utilisateurJpaRepository.findById(idAuteur)
                    .orElseThrow(() -> new ReferentielIntrouvableException("Utilisateur introuvable : " + idAuteur)));
        }
        entree.setDescription(description);
        historiqueJpa.save(entree);
    }

    private static PieceJustificativeResume toPieceResume(PieceJustificative p) {
        return new PieceJustificativeResume(
                p.getIdPiece(),
                p.getTypePiece().getCode(),
                p.getTypePiece().getLibelle(),
                p.getCheminFichier(),
                p.getStatutValidation().name(),
                p.getDateDepot(),
                p.getMotifRejet(),
                p.isModifieParAgent(),
                p.isVerifieParIA()
        );
    }

    private static Personne toPersonne(Utilisateur u) {
        return new Personne(u.getIdUtilisateur(), u.getNom(), u.getPrenom(), u.getEmail());
    }

    private static String nomComplet(Utilisateur u) {
        return u.getPrenom() + " " + u.getNom();
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoriqueEntree> findHistoriqueByDossierId(Integer idDossier) {
        return historiqueJpa.findByDossier_IdDossierOrderByDateActionDesc(idDossier)
                .stream()
                .map(h -> new HistoriqueEntree(
                        h.getIdHistorique(),
                        h.getDateAction(),
                        h.getTypeAction().name(),
                        h.getStatutAvant() != null ? h.getStatutAvant().getLibelle() : null,
                        h.getStatutApres() != null ? h.getStatutApres().getLibelle() : null,
                        resolveNomAuteur(h),
                        h.getDescription()
                ))
                .toList();
    }

    @Override
    @Transactional
    public void validerOuRejeterPiece(ValidationPiece validation) {
        PieceJustificative piece = pieceJpa.findById(validation.idPiece())
                .filter(p -> p.getDossier().getIdDossier().equals(validation.idDossier()))
                .orElseThrow(() -> new PieceIntrouvableException(validation.idPiece()));

        Agent agent = agentJpaRepository.findById(validation.idAgent())
                .orElseThrow(() -> new ReferentielIntrouvableException("Agent introuvable : " + validation.idAgent()));

        piece.setStatutValidation(validation.valider()
                ? PieceJustificative.StatutValidation.validee
                : PieceJustificative.StatutValidation.rejetee);
        piece.setAgentValidation(agent);
        piece.setDateValidation(LocalDateTime.now());
        piece.setMotifRejet(validation.valider() ? null : validation.motifRejet());
        pieceJpa.save(piece);

        Dossier dossier = dossierJpa.findById(validation.idDossier())
                .orElseThrow(() -> new DossierIntrouvableException(validation.idDossier()));

        HistoriqueDossier entree = new HistoriqueDossier();
        entree.setDossier(dossier);
        entree.setDateAction(LocalDateTime.now());
        entree.setTypeAction(validation.valider()
                ? HistoriqueDossier.TypeAction.validation_piece
                : HistoriqueDossier.TypeAction.rejet_piece);
        entree.setAgent(agent);
        entree.setDescription(validation.valider()
                ? "Pièce validée : " + piece.getTypePiece().getLibelle()
                : "Pièce rejetée : " + piece.getTypePiece().getLibelle() + " — " + validation.motifRejet());
        historiqueJpa.save(entree);

        // Auto-transitions selon le contexte :
        // - Rejet d'une piece sur EN_VERIFICATION -> INCOMPLET (re-upload attendu).
        // - Validation de la derniere piece restante en attente -> VALIDE depuis
        //   EN_VERIFICATION ou INCOMPLET (un dossier peut etre repris apres
        //   correction des pieces rejetees / ajout de pieces manquantes).
        String codeActuel = dossier.getStatutActuel().getCode();
        boolean instructible = CodeStatutDossier.EN_VERIFICATION.name().equals(codeActuel)
                || CodeStatutDossier.INCOMPLET.name().equals(codeActuel);
        if (!validation.valider() && CodeStatutDossier.EN_VERIFICATION.name().equals(codeActuel)) {
            appliquerChangementStatut(dossier, CodeStatutDossier.INCOMPLET, agent,
                    "Statut passé à INCOMPLET suite au rejet d'une pièce.");
        } else if (validation.valider() && instructible
                && conditionsVALIDESatisfaites(dossier, piece)) {
            appliquerChangementStatut(dossier, CodeStatutDossier.VALIDE, agent,
                    "Statut passé à VALIDÉ : toutes les pièces ont été validées.");
        }
    }

    /**
     * Vrai si toutes les conditions pour passer le dossier a VALIDE sont reunies :
     * - toutes les pieces existantes du dossier sont {@code validee} (la piece
     *   qu'on vient de sauvegarder est exclue de la query pour eviter le piege
     *   du flush Hibernate non garanti ; on sait qu'elle vient d'etre validee
     *   puisqu'on rentre dans ce code path).
     * - chaque type de piece marque obligatoire pour le typeAbonnement du
     *   dossier est couvert par une piece {@code validee}. Si le referentiel
     *   {@code piece_requise} ne contient rien pour ce type, on ne bloque pas
     *   (compatibilite avec les abonnements pas encore configures).
     */
    private boolean conditionsVALIDESatisfaites(Dossier dossier, PieceJustificative pieceVenantDEtreValidee) {
        List<PieceJustificative> autresPieces = pieceJpa
                .findByDossier_IdDossierOrderByDateDepotDesc(dossier.getIdDossier())
                .stream()
                .filter(p -> !p.getIdPiece().equals(pieceVenantDEtreValidee.getIdPiece()))
                .toList();
        boolean autresToutesValidees = autresPieces.stream()
                .allMatch(p -> p.getStatutValidation() == PieceJustificative.StatutValidation.validee);
        if (!autresToutesValidees) return false;

        // Couverture des pieces obligatoires du referentiel
        List<PieceRequise> requises = pieceRequiseJpa
                .findByTypeAbonnement_Code(dossier.getTypeAbonnement().getCode());
        if (requises.isEmpty()) return true;
        java.util.Set<Integer> codesValidees = java.util.stream.Stream.concat(
                autresPieces.stream(), java.util.stream.Stream.of(pieceVenantDEtreValidee))
                .filter(p -> p.getStatutValidation() == PieceJustificative.StatutValidation.validee)
                .map(p -> p.getTypePiece().getIdTypePiece())
                .collect(java.util.stream.Collectors.toSet());
        return requises.stream()
                .filter(PieceRequise::isObligatoire)
                .allMatch(r -> codesValidees.contains(r.getTypePiece().getIdTypePiece()));
    }

    /**
     * Change le statut d'un dossier (action manuelle d'un agent depuis le
     * backoffice). Trace l'evolution dans l'historique avec statutAvant /
     * statutApres pour permettre l'affichage de la transition.
     */
    @Override
    @Transactional
    public void changerStatut(Integer idDossier, CodeStatutDossier codeStatut, Integer idAgent) {
        Dossier dossier = dossierJpa.findById(idDossier)
                .orElseThrow(() -> new DossierIntrouvableException(idDossier));
        Agent agent = agentJpaRepository.findById(idAgent)
                .orElseThrow(() -> new ReferentielIntrouvableException("Agent introuvable : " + idAgent));
        // No-op si le statut est deja le bon (idempotence).
        if (codeStatut.name().equals(dossier.getStatutActuel().getCode())) {
            return;
        }
        appliquerChangementStatut(dossier, codeStatut, agent, null);
    }

    /**
     * Coeur de la transition de statut. Pose le nouveau statut sur le dossier
     * + entree d'historique (typeAction=changement_statut, statutAvant/Apres).
     * {@code descriptionOverride} est utilise quand l'appelant veut documenter
     * la cause (ex: rejet d'une piece) ; null = description par defaut.
     */
    private void appliquerChangementStatut(Dossier dossier, CodeStatutDossier nouveauCode,
                                            Agent agent, String descriptionOverride) {
        StatutDossier nouveauStatut = statutDossierJpaRepository.findByCode(nouveauCode.name())
                .orElseThrow(() -> new ReferentielIntrouvableException("Statut introuvable : " + nouveauCode));
        StatutDossier ancienStatut = dossier.getStatutActuel();

        dossier.setStatutActuel(nouveauStatut);
        dossierJpa.save(dossier);

        HistoriqueDossier entree = new HistoriqueDossier();
        entree.setDossier(dossier);
        entree.setDateAction(LocalDateTime.now());
        entree.setTypeAction(HistoriqueDossier.TypeAction.changement_statut);
        entree.setStatutAvant(ancienStatut);
        entree.setStatutApres(nouveauStatut);
        entree.setAgent(agent);
        // Pas de description par defaut pour un changement de statut : la transition
        // est deja affichee cote UI via le pill {statutAvant -> statutApres}. La
        // description n'est posee que pour expliciter la cause d'une auto-transition
        // (ex: rejet d'une piece) via descriptionOverride.
        entree.setDescription(descriptionOverride);
        historiqueJpa.save(entree);
    }

    private String genererNumeroDossier() {
        int annee = java.time.LocalDate.now().getYear();
        SequenceAnnuelleDossier seq = sequenceJpa.findByAnneeForUpdate(annee)
                .orElseGet(() -> {
                    SequenceAnnuelleDossier nouveau = new SequenceAnnuelleDossier();
                    nouveau.setAnnee(annee);
                    nouveau.setDernierNumero(0);
                    return sequenceJpa.save(nouveau);
                });
        seq.setDernierNumero(seq.getDernierNumero() + 1);
        sequenceJpa.save(seq);
        return String.format("DOS-%d-%06d", annee, seq.getDernierNumero());
    }

    private static String resolveNomAuteur(HistoriqueDossier h) {
        if (h.getAgent() != null) return h.getAgent().getPrenom() + " " + h.getAgent().getNom();
        if (h.getUtilisateur() != null) return h.getUtilisateur().getPrenom() + " " + h.getUtilisateur().getNom();
        return "Système";
    }
}
