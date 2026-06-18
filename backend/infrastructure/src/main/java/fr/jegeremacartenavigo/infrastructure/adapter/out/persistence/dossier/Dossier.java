package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnement;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.support.SupportNavigo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entite centrale : distingue porteur (titulaire) et payeur (financeur).
 */
@Entity
@Table(name = "dossier")
@Getter
@Setter
@NoArgsConstructor
public class Dossier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dossier")
    private Integer idDossier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur_porteur", nullable = false)
    private Utilisateur utilisateurPorteur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur_payeur", nullable = false)
    private Utilisateur utilisateurPayeur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_type_abonnement", nullable = false)
    private TypeAbonnement typeAbonnement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_support")
    private SupportNavigo support;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_statut_actuel", nullable = false)
    private StatutDossier statutActuel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent_referent")
    private Agent agentReferent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier_precedent")
    private Dossier dossierPrecedent;

    @Column(name = "numero_dossier", length = 20, unique = true)
    private String numeroDossier;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_creation", length = 20, nullable = false)
    private CanalCreation canalCreation;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_debut_droits")
    private LocalDate dateDebutDroits;

    @Column(name = "date_fin_droits")
    private LocalDate dateFinDroits;

    @Column(name = "montant_total", precision = 8, scale = 2, nullable = false)
    private BigDecimal montantTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "periodicite_paiement", length = 10, nullable = false)
    private PeriodicitePaiement periodicitePaiement;

    // Colonnes ajoutees en V9 pour le RecommendationWizard front (cf.
    // CONTEXT.md) : situation et beneficiaire en texte libre plutot que
    // relies a `situation`/`utilisateur`, ces referentiels/relations n'etant
    // fiables qu'en environnement seede.
    @Column(name = "situation_code", length = 30, nullable = false)
    private String situationCode;

    @Column(name = "situation_precision", length = 200)
    private String situationPrecision;

    @Column(name = "boursier", nullable = false)
    private boolean boursier = false;

    @Column(name = "beneficiaire_nom_complet", length = 200)
    private String beneficiaireNomComplet;

    public enum CanalCreation {
        en_ligne, agence, backoffice
    }

    public enum PeriodicitePaiement {
        ponctuel, mensuel, annuel
    }
}
