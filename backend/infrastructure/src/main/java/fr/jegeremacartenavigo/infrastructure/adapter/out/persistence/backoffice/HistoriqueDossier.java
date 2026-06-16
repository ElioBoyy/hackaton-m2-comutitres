package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
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

import java.time.LocalDateTime;

/** Trace exhaustive de toutes les actions sur un dossier. */
@Entity
@Table(name = "historique_dossier")
@Getter
@Setter
@NoArgsConstructor
public class HistoriqueDossier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_historique")
    private Integer idHistorique;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_dossier", nullable = false)
    private Dossier dossier;

    @Column(name = "date_action", nullable = false)
    private LocalDateTime dateAction;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_action", length = 40, nullable = false)
    private TypeAction typeAction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_statut_avant")
    private StatutDossier statutAvant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_statut_apres")
    private StatutDossier statutApres;

    /** Null si action initiee par l'utilisateur ou automatique. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent")
    private Agent agent;

    /** Null si action agent ou automatique. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @Column(name = "description")
    private String description;

    public enum TypeAction {
        changement_statut, depot_piece, validation_piece, rejet_piece,
        paiement_enregistre, remboursement_traite, modification_information,
        commentaire_ajoute, action_pour_compte_utilisateur, notification_envoyee
    }
}
