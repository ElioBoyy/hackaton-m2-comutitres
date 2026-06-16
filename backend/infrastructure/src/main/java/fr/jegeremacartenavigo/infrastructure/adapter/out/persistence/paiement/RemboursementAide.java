package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.paiement;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.CritereEligibilite;
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
import java.time.LocalDateTime;

@Entity
@Table(name = "remboursement_aide")
@Getter
@Setter
@NoArgsConstructor
public class RemboursementAide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_remboursement")
    private Integer idRemboursement;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_dossier", nullable = false)
    private Dossier dossier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_critere")
    private CritereEligibilite critere;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_aide", length = 30, nullable = false)
    private TypeAide typeAide;

    @Column(name = "montant_demande", precision = 8, scale = 2, nullable = false)
    private BigDecimal montantDemande;

    @Column(name = "montant_accorde", precision = 8, scale = 2)
    private BigDecimal montantAccorde;

    @Column(name = "date_demande", nullable = false)
    private LocalDateTime dateDemande;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 20, nullable = false)
    private Statut statut = Statut.en_attente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent_traitant")
    private Agent agentTraitant;

    public enum TypeAide {
        remboursement_partiel, remboursement_total, subvention_departementale
    }

    public enum Statut {
        en_attente, valide, rejete, verse
    }
}
