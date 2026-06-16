package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

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

@Entity
@Table(name = "critere_eligibilite")
@Getter
@Setter
@NoArgsConstructor
public class CritereEligibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_critere")
    private Integer idCritere;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_type_abonnement", nullable = false)
    private TypeAbonnement typeAbonnement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_situation")
    private Situation situation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_departement")
    private Departement departement;

    @Column(name = "age_min")
    private Integer ageMin;

    @Column(name = "age_max")
    private Integer ageMax;

    @Column(name = "seuil_quotient_familial_max", precision = 10, scale = 2)
    private BigDecimal seuilQuotientFamilialMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_avantage", length = 30, nullable = false)
    private TypeAvantage typeAvantage;

    @Column(name = "taux_reduction_pct", precision = 5, scale = 2)
    private BigDecimal tauxReductionPct;

    @Column(name = "montant_remboursement_max", precision = 8, scale = 2)
    private BigDecimal montantRemboursementMax;

    @Column(name = "libelle", length = 150, nullable = false)
    private String libelle;

    @Column(name = "description")
    private String description;

    @Column(name = "date_debut_validite", nullable = false)
    private LocalDate dateDebutValidite;

    @Column(name = "date_fin_validite")
    private LocalDate dateFinValidite;

    @Column(name = "actif", nullable = false)
    private boolean actif = true;

    public enum TypeAvantage {
        tarif_reduit, gratuite, remboursement_partiel, remboursement_total
    }
}
