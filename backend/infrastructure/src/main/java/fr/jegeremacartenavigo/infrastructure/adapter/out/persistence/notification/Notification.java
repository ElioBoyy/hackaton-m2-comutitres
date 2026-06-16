package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.notification;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")
    private Integer idNotification;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier")
    private Dossier dossier;

    /** Avantage a l'origine de la notification, si applicable. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_critere")
    private CritereEligibilite critere;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notification", length = 40, nullable = false)
    private TypeNotification typeNotification;

    @Column(name = "titre", length = 150, nullable = false)
    private String titre;

    @Column(name = "contenu")
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal", length = 10, nullable = false)
    private Canal canal;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_envoi")
    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_envoi", length = 20, nullable = false)
    private StatutEnvoi statutEnvoi = StatutEnvoi.en_attente;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_lecture", length = 10, nullable = false)
    private StatutLecture statutLecture = StatutLecture.non_lu;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    public enum TypeNotification {
        nouvelle_reduction_disponible, remboursement_disponible, document_manquant,
        document_rejete, statut_dossier_change, rappel_paiement
    }

    public enum Canal {
        email, sms, push, in_app
    }

    public enum StatutEnvoi {
        en_attente, envoyee, echec
    }

    public enum StatutLecture {
        non_lu, lu
    }
}
