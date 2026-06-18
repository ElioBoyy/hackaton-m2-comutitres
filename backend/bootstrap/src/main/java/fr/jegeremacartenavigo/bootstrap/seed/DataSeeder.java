package fr.jegeremacartenavigo.bootstrap.seed;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.AgentJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.DossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.PieceJustificative;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.PieceJustificativeJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.SequenceAnnuelleDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.SequenceAnnuelleDossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Adresse;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.AdresseJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.RelationUtilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.RelationUtilisateurJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.UtilisateurJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.notification.Notification;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.notification.NotificationJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.Departement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.DepartementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.RoleAgent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.RoleAgentJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.Situation;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.SituationJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnementJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificative;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificativeJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.CategorieSav;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.CategorieSavJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Jeu de donnees de demo/dev : referentiels (valeurs de l'annexe du modele de
 * donnees) + quelques agents/utilisateurs/dossier pour avoir un parcours complet
 * a montrer. N'est actif que sur le profil "seed" et ne s'execute que si la
 * base est vide (idempotent au redemarrage).
 *
 * <p>Lancement : {@code ./mvnw -pl bootstrap spring-boot:run -Dspring-boot.run.profiles=seed}
 */
@Component
@Profile("seed")
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final DepartementJpaRepository departementRepository;
    private final SituationJpaRepository situationRepository;
    private final TypeAbonnementJpaRepository typeAbonnementRepository;
    private final StatutDossierJpaRepository statutDossierRepository;
    private final TypePieceJustificativeJpaRepository typePieceRepository;
    private final RoleAgentJpaRepository roleAgentRepository;
    private final CategorieSavJpaRepository categorieSavRepository;
    private final AgentJpaRepository agentRepository;
    private final UtilisateurJpaRepository utilisateurRepository;
    private final AdresseJpaRepository adresseRepository;
    private final RelationUtilisateurJpaRepository relationUtilisateurRepository;
    private final DossierJpaRepository dossierRepository;
    private final PieceJustificativeJpaRepository pieceRepository;
    private final SequenceAnnuelleDossierJpaRepository sequenceRepository;
    private final NotificationJpaRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(
            DepartementJpaRepository departementRepository,
            SituationJpaRepository situationRepository,
            TypeAbonnementJpaRepository typeAbonnementRepository,
            StatutDossierJpaRepository statutDossierRepository,
            TypePieceJustificativeJpaRepository typePieceRepository,
            RoleAgentJpaRepository roleAgentRepository,
            CategorieSavJpaRepository categorieSavRepository,
            AgentJpaRepository agentRepository,
            UtilisateurJpaRepository utilisateurRepository,
            AdresseJpaRepository adresseRepository,
            RelationUtilisateurJpaRepository relationUtilisateurRepository,
            DossierJpaRepository dossierRepository,
            PieceJustificativeJpaRepository pieceRepository,
            SequenceAnnuelleDossierJpaRepository sequenceRepository,
            PasswordEncoder passwordEncoder,
            NotificationJpaRepository notificationRepository
    ) {
        this.departementRepository = departementRepository;
        this.situationRepository = situationRepository;
        this.typeAbonnementRepository = typeAbonnementRepository;
        this.statutDossierRepository = statutDossierRepository;
        this.typePieceRepository = typePieceRepository;
        this.roleAgentRepository = roleAgentRepository;
        this.categorieSavRepository = categorieSavRepository;
        this.agentRepository = agentRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.adresseRepository = adresseRepository;
        this.relationUtilisateurRepository = relationUtilisateurRepository;
        this.dossierRepository = dossierRepository;
        this.pieceRepository = pieceRepository;
        this.sequenceRepository = sequenceRepository;
        this.passwordEncoder = passwordEncoder;
        this.notificationRepository = notificationRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (departementRepository.count() > 0) {
            log.info("Donnees de seed deja presentes, on ne rejoue rien.");
            return;
        }

        log.info("Seed : insertion des referentiels et des donnees de demo...");

        Map<String, Departement> departements = seedDepartements();
        seedSituations();
        Map<String, TypeAbonnement> typesAbonnement = seedTypesAbonnement();
        Map<String, StatutDossier> statuts = seedStatutsDossier();
        seedTypesPieceJustificative();
        Map<String, RoleAgent> roles = seedRolesAgent();
        seedCategoriesSav();

        Agent gestionnaire = seedAgents(roles);
        Map<String, Utilisateur> utilisateurs = seedUtilisateursEtAdresses(departements);
        Utilisateur etudiante = utilisateurs.get("etudiante");
        Utilisateur retraite = utilisateurs.get("retraite");
        Utilisateur alternante = utilisateurs.get("alternante");

        List<Dossier> dossiersSeed = seedDossiersDemo(
                List.of(etudiante, retraite, alternante), typesAbonnement, statuts, gestionnaire);
        seedPiecesDemo(dossiersSeed, etudiante);
        seedNotificationsDemo(etudiante, dossiersSeed.get(0));

        log.info("Seed termine.");
    }

    private Map<String, Departement> seedDepartements() {
        List<Departement> idf = List.of(
                departement("75", "Paris", "Ile-de-France"),
                departement("77", "Seine-et-Marne", "Ile-de-France"),
                departement("78", "Yvelines", "Ile-de-France"),
                departement("91", "Essonne", "Ile-de-France"),
                departement("92", "Hauts-de-Seine", "Ile-de-France"),
                departement("93", "Seine-Saint-Denis", "Ile-de-France"),
                departement("94", "Val-de-Marne", "Ile-de-France"),
                departement("95", "Val-d'Oise", "Ile-de-France")
        );
        departementRepository.saveAll(idf);
        return idf.stream().collect(java.util.stream.Collectors.toMap(Departement::getIdDepartement, d -> d));
    }

    private Departement departement(String code, String libelle, String region) {
        Departement d = new Departement();
        d.setIdDepartement(code);
        d.setLibelle(libelle);
        d.setRegion(region);
        return d;
    }

    private void seedSituations() {
        situationRepository.saveAll(List.of(
                situation("Etudiant", "Inscrit dans un etablissement d'enseignement superieur"),
                situation("Apprenti / Alternant", "Sous contrat d'apprentissage ou de professionnalisation"),
                situation("Scolaire (college/lycee)", "Eleve du secondaire"),
                situation("Demandeur d'emploi", "Inscrit a Pole Emploi"),
                situation("Beneficiaire RSA/ASS", "Beneficiaire d'un minima social"),
                situation("Senior 65+", "Age de 65 ans ou plus"),
                situation("Personne en situation de handicap (RQTH)", "Reconnaissance de la qualite de travailleur handicape"),
                situation("Salarie", "En activite professionnelle salariee"),
                situation("Famille nombreuse", "Foyer avec 3 enfants ou plus")
        ));
    }

    private Situation situation(String libelle, String description) {
        Situation s = new Situation();
        s.setLibelle(libelle);
        s.setDescription(description);
        return s;
    }

    private Map<String, TypeAbonnement> seedTypesAbonnement() {
        List<TypeAbonnement> types = List.of(
                // ── Navigo standard (tarifs 2026) ──────────────────────────────────
                typeAbonnement("NAVIGO_ANNUEL", "Navigo Annuel", "Navigo standard",
                        TypeAbonnement.Periodicite.annuelle, new BigDecimal("998.80")),
                typeAbonnement("NAVIGO_MENSUEL", "Navigo Mensuel", "Navigo standard",
                        TypeAbonnement.Periodicite.mensuelle, new BigDecimal("90.80")),
                typeAbonnement("NAVIGO_HEBDO", "Navigo Hebdomadaire", "Navigo standard",
                        TypeAbonnement.Periodicite.hebdomadaire, new BigDecimal("32.40")),
                typeAbonnement("NAVIGO_LIBERTE_PLUS", "Navigo Liberte+", "Navigo standard",
                        TypeAbonnement.Periodicite.sans_abonnement, null),
                // Support physique rechargeable — pas un abonnement, frais de carte uniquement
                typeAbonnement("NAVIGO_DECOUVERTE", "Navigo Decouverte", "Navigo standard",
                        TypeAbonnement.Periodicite.sans_abonnement, new BigDecimal("5.00")),

                // ── Forfaits seniors ───────────────────────────────────────────────
                // Navigo Senior : 50 % de reduction sur Navigo Annuel, reservé 62+ non-actif
                typeAbonnement("NAVIGO_SENIOR", "Navigo Senior", "Forfait senior",
                        TypeAbonnement.Periodicite.annuelle, new BigDecimal("544.80")),
                // Amethyste : attribue et finance par le departement, tarif variable selon departement
                typeAbonnement("AMETHYSTE", "Amethyste", "Forfait senior",
                        TypeAbonnement.Periodicite.annuelle, null),

                // ── Forfaits jeunes / scolaires ────────────────────────────────────
                // Imagine R Junior : moins de 11 ans au 31/12
                typeAbonnement("IMAGINE_R_JUNIOR", "Imagine R Junior", "Forfait scolaire-etudiant",
                        TypeAbonnement.Periodicite.annuelle, new BigDecimal("24.40")),
                // Imagine R Scolaire : moins de 16 ans au 1er sept ou apprenti moins de 26 ans
                typeAbonnement("IMAGINE_R_SCOLAIRE", "Imagine R Scolaire", "Forfait scolaire-etudiant",
                        TypeAbonnement.Periodicite.annuelle, new BigDecimal("374.40")),
                // Imagine R Etudiant : etudiant moins de 26 ans (hors apprentissage)
                typeAbonnement("IMAGINE_R_ETUDIANT", "Imagine R Etudiant", "Forfait scolaire-etudiant",
                        TypeAbonnement.Periodicite.annuelle, new BigDecimal("374.40")),
                // Imagine R Apprenti : apprenti moins de 26 ans (meme eligibilite que Scolaire)
                typeAbonnement("IMAGINE_R_APPRENTI", "Imagine R Apprenti", "Forfait scolaire-etudiant",
                        TypeAbonnement.Periodicite.annuelle, new BigDecimal("374.40")),
                // Transport Scolaire departemental : bus domicile-ecole, gratuit
                typeAbonnement("TRANSPORT_SCOLAIRE", "Transport Scolaire departemental", "Forfait scolaire-etudiant",
                        TypeAbonnement.Periodicite.annuelle, BigDecimal.ZERO),

                // ── Tarification solidaire ─────────────────────────────────────────
                // Solidarite Gratuite : RSA / ASS, voyage gratuit toutes zones
                typeAbonnement("SOLIDARITE_GRATUITE", "Solidarite Gratuite", "Tarification solidaire",
                        TypeAbonnement.Periodicite.mensuelle, BigDecimal.ZERO),
                // Solidarite 75 % : CSS beneficiaires, 75 % de reduction
                typeAbonnement("SOLIDARITE_75", "Navigo Solidarite 75%", "Tarification solidaire",
                        TypeAbonnement.Periodicite.mensuelle, new BigDecimal("21.00")),
                // Solidarite 50 % : AME beneficiaires, 50 % de reduction
                typeAbonnement("SOLIDARITE_50", "Navigo Solidarite 50%", "Tarification solidaire",
                        TypeAbonnement.Periodicite.mensuelle, new BigDecimal("42.05")),
                // Ancienne entree conservee pour compatibilite avec les dossiers de demo existants
                typeAbonnement("SOLIDARITE_TRANSPORT", "Solidarite Transport", "Tarification solidaire",
                        TypeAbonnement.Periodicite.annuelle, null)
        );
        typeAbonnementRepository.saveAll(types);
        return types.stream().collect(java.util.stream.Collectors.toMap(TypeAbonnement::getCode, t -> t));
    }

    private static final String[] TRANSPORTS_NAVIGO = {"METRO", "RER", "TRAIN", "TRAMWAY", "BUS"};
    private static final String[] ZONES_TOUTES = {"Z1", "Z2", "Z3", "Z4", "Z5"};

    private TypeAbonnement typeAbonnement(String code, String libelle, String categorie,
                                           TypeAbonnement.Periodicite periodicite, BigDecimal tarifPlein) {
        TypeAbonnement t = new TypeAbonnement();
        t.setCode(code);
        t.setLibelle(libelle);
        t.setCategorie(categorie);
        t.setPeriodicite(periodicite);
        t.setTarifPlein(tarifPlein);
        t.setActif(true);
        t.setTransports(TRANSPORTS_NAVIGO);
        t.setZones(ZONES_TOUTES);
        return t;
    }

    private Map<String, StatutDossier> seedStatutsDossier() {
        List<StatutDossier> statuts = List.of(
                statutDossier("BROUILLON", "Brouillon", 1, StatutDossier.Categorie.en_cours),
                statutDossier("EN_VERIFICATION", "En cours de verification", 2, StatutDossier.Categorie.en_cours),
                statutDossier("INCOMPLET", "Incomplet", 3, StatutDossier.Categorie.en_cours),
                statutDossier("EN_ATTENTE_PAIEMENT", "En attente de paiement", 4, StatutDossier.Categorie.en_cours),
                statutDossier("VALIDE", "Valide", 5, StatutDossier.Categorie.abouti),
                statutDossier("ACTIF", "Actif", 6, StatutDossier.Categorie.abouti),
                statutDossier("REJETE", "Rejete", 7, StatutDossier.Categorie.rejete),
                statutDossier("RESILIE", "Resilie", 8, StatutDossier.Categorie.clos),
                statutDossier("EXPIRE", "Expire", 9, StatutDossier.Categorie.clos)
        );
        statutDossierRepository.saveAll(statuts);
        return statuts.stream().collect(java.util.stream.Collectors.toMap(StatutDossier::getCode, s -> s));
    }

    private StatutDossier statutDossier(String code, String libelle, int ordre, StatutDossier.Categorie categorie) {
        StatutDossier s = new StatutDossier();
        s.setCode(code);
        s.setLibelle(libelle);
        s.setOrdre(ordre);
        s.setCategorie(categorie);
        return s;
    }

    private void seedTypesPieceJustificative() {
        typePieceRepository.saveAll(List.of(
                typePiece("PIECE_IDENTITE", "Piece d'identite", null),
                typePiece("PHOTO_IDENTITE", "Photo d'identite", null),
                typePiece("JUSTIFICATIF_DOMICILE", "Justificatif de domicile", 90),
                typePiece("CERTIFICAT_SCOLARITE", "Certificat de scolarite", 365),
                typePiece("CARTE_ETUDIANT", "Carte etudiant", 365),
                typePiece("CONTRAT_APPRENTISSAGE", "Contrat d'apprentissage", null),
                typePiece("ATTESTATION_POLE_EMPLOI", "Attestation Pole Emploi/ASS", 90),
                typePiece("NOTIFICATION_CAF", "Notification CAF (quotient familial)", 365),
                typePiece("AVIS_IMPOSITION", "Avis d'imposition", 365),
                typePiece("CARTE_INVALIDITE_RQTH", "Carte d'invalidite/RQTH", null),
                typePiece("RIB", "RIB", null)
        ));
    }

    private TypePieceJustificative typePiece(String code, String libelle, Integer dureeValiditeJours) {
        TypePieceJustificative p = new TypePieceJustificative();
        p.setCode(code);
        p.setLibelle(libelle);
        p.setDureeValiditeJours(dureeValiditeJours);
        return p;
    }

    private Map<String, RoleAgent> seedRolesAgent() {
        List<RoleAgent> roles = List.of(
                roleAgent("Gestionnaire", "[\"dossier:read\",\"dossier:update\"]"),
                roleAgent("Valideur pieces", "[\"piece:validate\",\"piece:reject\"]"),
                roleAgent("Superviseur", "[\"dossier:read\",\"dossier:update\",\"piece:validate\",\"piece:reject\",\"agent:read\"]"),
                roleAgent("Administrateur", "[\"*\"]")
        );
        roleAgentRepository.saveAll(roles);
        return roles.stream().collect(java.util.stream.Collectors.toMap(RoleAgent::getLibelle, r -> r));
    }

    private RoleAgent roleAgent(String libelle, String permissions) {
        RoleAgent r = new RoleAgent();
        r.setLibelle(libelle);
        r.setPermissions(permissions);
        return r;
    }

    private void seedCategoriesSav() {
        categorieSavRepository.saveAll(List.of(
                categorieSav("ACCES_COMPTE", "Probleme d'acces compte", CategorieSav.CanalPrioritaire.chatbot),
                categorieSav("PIECE_REFUSEE", "Piece refusee", CategorieSav.CanalPrioritaire.chatbot),
                categorieSav("ERREUR_PRELEVEMENT", "Erreur de prelevement", CategorieSav.CanalPrioritaire.telephone),
                categorieSav("DEMANDE_REMBOURSEMENT", "Demande de remboursement", CategorieSav.CanalPrioritaire.email),
                categorieSav("PERTE_VOL_CARTE", "Perte/vol de carte", CategorieSav.CanalPrioritaire.telephone),
                categorieSav("ABONNEMENT_NON_ACTIVE", "Abonnement non active", CategorieSav.CanalPrioritaire.chatbot),
                categorieSav("QUESTION_TARIFAIRE", "Question tarifaire", CategorieSav.CanalPrioritaire.chatbot),
                categorieSav("RECLAMATION", "Reclamation", CategorieSav.CanalPrioritaire.email),
                categorieSav("AUTRE", "Autre", CategorieSav.CanalPrioritaire.chat_agent)
        ));
    }

    private CategorieSav categorieSav(String code, String libelle, CategorieSav.CanalPrioritaire canal) {
        CategorieSav c = new CategorieSav();
        c.setCode(code);
        c.setLibelle(libelle);
        c.setCanalPrioritaire(canal);
        return c;
    }

    private Agent seedAgents(Map<String, RoleAgent> roles) {
        Agent gestionnaire = agent("Dupont", "Claire", "AG-1001", "claire.dupont@idfm.fr",
                roles.get("Gestionnaire"), "Souscriptions");
        Agent administrateur = agent("Lefevre", "Marc", "AG-1002", "marc.lefevre@idfm.fr",
                roles.get("Administrateur"), "Support technique");
        agentRepository.saveAll(List.of(gestionnaire, administrateur));
        return gestionnaire;
    }

    private Agent agent(String nom, String prenom, String identifiantPro, String email,
                         RoleAgent role, String equipe) {
        Agent a = new Agent();
        a.setNom(nom);
        a.setPrenom(prenom);
        a.setIdentifiantPro(identifiantPro);
        a.setEmail(email);
        a.setRole(role);
        a.setEquipe(equipe);
        a.setActif(true);
        // Mot de passe de demo par defaut = identifiant pro + suffixe (aucun flow de
        // creation de compte agent aujourd'hui, les agents sont uniquement crees par
        // ce seed). Suffixe necessaire car identifiantPro seul fait moins de 8
        // caracteres (regle de validation du formulaire de login).
        a.setMotDePasseHash(passwordEncoder.encode(identifiantPro + "-demo"));
        return a;
    }

    private Map<String, Utilisateur> seedUtilisateursEtAdresses(Map<String, Departement> departements) {
        Utilisateur etudiante = utilisateur("Martin", "Lea", LocalDate.of(2003, 4, 12),
                "lea.martin@example.com", "0601020304");
        Utilisateur parent = utilisateur("Haddad", "Karim", LocalDate.of(1980, 9, 23),
                "karim.haddad@example.com", "0605060708");
        Utilisateur enfant = utilisateur("Haddad", "Noah", LocalDate.of(2012, 1, 15),
                "noah.haddad@example.com", "0605060709");
        Utilisateur retraite = utilisateur("Bernard", "Jacques", LocalDate.of(1958, 3, 7),
                "jacques.bernard@example.com", "0609080706");
        Utilisateur alternante = utilisateur("Nguyen", "Sophie", LocalDate.of(2001, 11, 20),
                "sophie.nguyen@example.com", "0612131415");
        utilisateurRepository.saveAll(List.of(etudiante, parent, enfant, retraite, alternante));

        adresseRepository.saveAll(List.of(
                adresse(etudiante, departements.get("75"), "12 rue de Rivoli", "75004", "Paris"),
                adresse(parent, departements.get("92"), "5 avenue du General Leclerc", "92100", "Boulogne-Billancourt"),
                adresse(enfant, departements.get("92"), "5 avenue du General Leclerc", "92100", "Boulogne-Billancourt"),
                adresse(retraite, departements.get("94"), "3 impasse des Lilas", "94200", "Ivry-sur-Seine"),
                adresse(alternante, departements.get("93"), "18 avenue de la Republique", "93100", "Montreuil")
        ));

        RelationUtilisateur relation = new RelationUtilisateur();
        relation.setUtilisateurPrincipal(parent);
        relation.setUtilisateurLie(enfant);
        relation.setTypeRelation(RelationUtilisateur.TypeRelation.parent_tuteur);
        relation.setDateDebut(LocalDate.of(2024, 9, 1));
        relation.setStatut(RelationUtilisateur.Statut.actif);
        relationUtilisateurRepository.save(relation);

        return Map.of("etudiante", etudiante, "parent", parent, "enfant", enfant,
                "retraite", retraite, "alternante", alternante);
    }

    private Utilisateur utilisateur(String nom, String prenom, LocalDate dateNaissance, String email, String telephone) {
        Utilisateur u = new Utilisateur();
        u.setNom(nom);
        u.setPrenom(prenom);
        u.setDateNaissance(dateNaissance);
        u.setEmail(email);
        u.setTelephone(telephone);
        u.setMotDePasseHash(passwordEncoder.encode("client-demo"));
        u.setDateCreationCompte(LocalDateTime.now());
        u.setStatutCompte(Utilisateur.StatutCompte.actif);
        return u;
    }

    private Adresse adresse(Utilisateur utilisateur, Departement departement, String numeroEtVoie, String codePostal, String ville) {
        Adresse a = new Adresse();
        a.setUtilisateur(utilisateur);
        a.setTypeAdresse(Adresse.TypeAdresse.domicile);
        a.setNumeroEtVoie(numeroEtVoie);
        a.setCodePostal(codePostal);
        a.setVille(ville);
        a.setDepartement(departement);
        a.setPays("France");
        a.setPrincipale(true);
        return a;
    }

    private List<Dossier> seedDossiersDemo(List<Utilisateur> clients, Map<String, TypeAbonnement> types,
                                     Map<String, StatutDossier> statuts, Agent agentReferent) {
        Utilisateur lea = clients.get(0);
        Utilisateur jacques = clients.get(1);
        Utilisateur sophie = clients.get(2);

        // index 0 = lea BROUILLON, 1 = lea EN_VERIFICATION, 2 = lea INCOMPLET, 3 = lea ACTIF
        List<Dossier> dossiers = List.of(
                dossier(lea, types.get("IMAGINE_R_ETUDIANT"), statuts.get("BROUILLON"), null,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusDays(1),
                        null, null, BigDecimal.ZERO, Dossier.PeriodicitePaiement.annuel),

                dossier(lea, types.get("NAVIGO_ANNUEL"), statuts.get("EN_VERIFICATION"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusDays(10),
                        null, null, new BigDecimal("860.00"), Dossier.PeriodicitePaiement.annuel),

                dossier(lea, types.get("IMAGINE_R_APPRENTI"), statuts.get("INCOMPLET"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusDays(20),
                        null, null, new BigDecimal("394.00"), Dossier.PeriodicitePaiement.annuel),

                dossier(lea, types.get("IMAGINE_R_ETUDIANT"), statuts.get("ACTIF"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusMonths(3),
                        LocalDate.now().minusMonths(3), LocalDate.now().plusMonths(9), new BigDecimal("394.00"), Dossier.PeriodicitePaiement.annuel),

                dossier(jacques, types.get("AMETHYSTE"), statuts.get("EN_ATTENTE_PAIEMENT"), agentReferent,
                        Dossier.CanalCreation.agence, LocalDateTime.now().minusDays(15),
                        null, null, BigDecimal.ZERO, Dossier.PeriodicitePaiement.annuel),

                dossier(jacques, types.get("NAVIGO_MENSUEL"), statuts.get("VALIDE"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusDays(30),
                        LocalDate.now(), LocalDate.now().plusMonths(1), new BigDecimal("86.40"), Dossier.PeriodicitePaiement.mensuel),

                dossier(jacques, types.get("IMAGINE_R_ETUDIANT"), statuts.get("ACTIF"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusMonths(2),
                        LocalDate.now().minusMonths(2), LocalDate.now().plusMonths(10), new BigDecimal("394.00"), Dossier.PeriodicitePaiement.annuel),

                dossier(sophie, types.get("NAVIGO_ANNUEL"), statuts.get("REJETE"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusDays(25),
                        null, null, new BigDecimal("860.00"), Dossier.PeriodicitePaiement.annuel),

                dossier(sophie, types.get("IMAGINE_R_APPRENTI"), statuts.get("RESILIE"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusMonths(14),
                        LocalDate.now().minusMonths(14), LocalDate.now().minusMonths(2), new BigDecimal("394.00"), Dossier.PeriodicitePaiement.annuel),

                dossier(sophie, types.get("NAVIGO_MENSUEL"), statuts.get("EXPIRE"), agentReferent,
                        Dossier.CanalCreation.en_ligne, LocalDateTime.now().minusMonths(3),
                        LocalDate.now().minusMonths(3), LocalDate.now().minusDays(5), new BigDecimal("86.40"), Dossier.PeriodicitePaiement.mensuel)
        );
        dossierRepository.saveAll(dossiers);
        return dossiers;
    }

    private void seedPiecesDemo(List<Dossier> dossiers, Utilisateur lea) {
        // dossier index 1 = lea EN_VERIFICATION : CNI + certificat en attente
        Dossier dossierVerif = dossiers.get(1);
        TypePieceJustificative tCni = typePieceRepository.findByCode("PIECE_IDENTITE").orElseThrow();
        TypePieceJustificative tCertif = typePieceRepository.findByCode("CERTIFICAT_SCOLARITE").orElseThrow();
        TypePieceJustificative tPhoto = typePieceRepository.findByCode("PHOTO_IDENTITE").orElseThrow();

        // dossier index 2 = lea INCOMPLET : une CNI rejetee
        Dossier dossierIncomplet = dossiers.get(2);

        // dossier index 3 = lea ACTIF : CNI + certificat valides
        Dossier dossierActif = dossiers.get(3);

        pieceRepository.saveAll(List.of(
                piece(dossierVerif, tCni, lea, "uploads/verif/cni_lea.pdf", PieceJustificative.StatutValidation.en_attente, null),
                piece(dossierVerif, tCertif, lea, "uploads/verif/certif_lea.pdf", PieceJustificative.StatutValidation.en_attente, null),
                piece(dossierVerif, tPhoto, lea, "uploads/verif/photo_lea.jpg", PieceJustificative.StatutValidation.en_attente, null),

                piece(dossierIncomplet, tCni, lea, "uploads/incomplet/cni_lea_v1.pdf", PieceJustificative.StatutValidation.rejetee, "Photo floue, document illisible"),
                piece(dossierIncomplet, tCertif, lea, "uploads/incomplet/certif_lea.pdf", PieceJustificative.StatutValidation.en_attente, null),

                piece(dossierActif, tCni, lea, "uploads/actif/cni_lea.pdf", PieceJustificative.StatutValidation.validee, null),
                piece(dossierActif, tCertif, lea, "uploads/actif/certif_lea.pdf", PieceJustificative.StatutValidation.validee, null),
                piece(dossierActif, tPhoto, lea, "uploads/actif/photo_lea.jpg", PieceJustificative.StatutValidation.validee, null)
        ));
    }

    private PieceJustificative piece(Dossier dossier, TypePieceJustificative type, Utilisateur depot,
                                      String chemin, PieceJustificative.StatutValidation statut, String motifRejet) {
        PieceJustificative p = new PieceJustificative();
        p.setDossier(dossier);
        p.setTypePiece(type);
        p.setUtilisateurDepot(depot);
        p.setCheminFichier(chemin);
        p.setDateDepot(LocalDateTime.now().minusDays(2));
        p.setStatutValidation(statut);
        p.setMotifRejet(motifRejet);
        return p;
    }

    private Dossier dossier(Utilisateur porteur, TypeAbonnement type, StatutDossier statut,
                             Agent agent, Dossier.CanalCreation canal, LocalDateTime dateCreation,
                             LocalDate dateDebut, LocalDate dateFin, BigDecimal montant,
                             Dossier.PeriodicitePaiement periodicite) {
        Dossier d = new Dossier();
        d.setUtilisateurPorteur(porteur);
        d.setUtilisateurPayeur(porteur);
        d.setTypeAbonnement(type);
        d.setStatutActuel(statut);
        d.setAgentReferent(agent);
        d.setCanalCreation(canal);
        d.setDateCreation(dateCreation);
        d.setDateDebutDroits(dateDebut);
        d.setDateFinDroits(dateFin);
        d.setMontantTotal(montant);
        d.setPeriodicitePaiement(periodicite);
        d.setSituationCode("Etudiant");
        d.setNumeroDossier("DOS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        d.setNumeroDossier(genererNumeroDossier(dateCreation.getYear()));
        return d;
    }

    private String genererNumeroDossier(int annee) {
        SequenceAnnuelleDossier seq = sequenceRepository.findById(annee).orElseGet(() -> {
            SequenceAnnuelleDossier nouveau = new SequenceAnnuelleDossier();
            nouveau.setAnnee(annee);
            nouveau.setDernierNumero(0);
            return sequenceRepository.save(nouveau);
        });
        seq.setDernierNumero(seq.getDernierNumero() + 1);
        sequenceRepository.save(seq);
        return String.format("DOS-%d-%06d", annee, seq.getDernierNumero());
    }

    /**
     * Alertes du bandeau dashboard pour Lea : 2 pertinentes et non lues (donc
     * visibles), + 2 qui doivent etre filtrees (mauvais type, ou deja lue) -
     * pour pouvoir verifier que le filtre du dashboard fonctionne vraiment.
     */
    private void seedNotificationsDemo(Utilisateur utilisateur, Dossier dossier) {
        notificationRepository.saveAll(List.of(
                notification(utilisateur, dossier, Notification.TypeNotification.nouvelle_reduction_disponible,
                        "Nouvelle reduction disponible",
                        "Vous etes peut-etre eligible a une remise tarifaire suite a un changement de situation.",
                        Notification.StatutLecture.non_lu),
                notification(utilisateur, dossier, Notification.TypeNotification.remboursement_disponible,
                        "Remboursement disponible",
                        "Un remboursement partiel est disponible sur votre dossier.",
                        Notification.StatutLecture.non_lu),
                notification(utilisateur, dossier, Notification.TypeNotification.nouvelle_reduction_disponible,
                        "Reduction (deja vue)",
                        "Alerte deja lue : ne doit pas apparaitre dans le bandeau.",
                        Notification.StatutLecture.lu),
                notification(utilisateur, dossier, Notification.TypeNotification.rappel_paiement,
                        "Rappel de paiement",
                        "Type hors perimetre du bandeau reduction/remboursement : ne doit pas apparaitre.",
                        Notification.StatutLecture.non_lu)
        ));
    }

    private Notification notification(Utilisateur utilisateur, Dossier dossier,
                                        Notification.TypeNotification type, String titre, String contenu,
                                        Notification.StatutLecture statutLecture) {
        Notification n = new Notification();
        n.setUtilisateur(utilisateur);
        n.setDossier(dossier);
        n.setTypeNotification(type);
        n.setTitre(titre);
        n.setContenu(contenu);
        n.setCanal(Notification.Canal.in_app);
        n.setDateCreation(LocalDateTime.now().minusDays(1));
        n.setStatutEnvoi(Notification.StatutEnvoi.envoyee);
        n.setDateEnvoi(LocalDateTime.now().minusDays(1));
        n.setStatutLecture(statutLecture);
        if (statutLecture == Notification.StatutLecture.lu) {
            n.setDateLecture(LocalDateTime.now());
        }
        return n;
    }
}
