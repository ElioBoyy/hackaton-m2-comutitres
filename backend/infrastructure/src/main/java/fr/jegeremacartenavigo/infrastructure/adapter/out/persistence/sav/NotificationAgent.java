package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
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

/** Notifications envoyees aux agents lors d'une escalade chatbot ou d'un ticket urgent. */
@Entity
@Table(name = "notification_agent")
@Getter
@Setter
@NoArgsConstructor
public class NotificationAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notif_agent")
    private Integer idNotifAgent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_ticket", nullable = false)
    private TicketSav ticket;

    /** Null = diffusion a l'equipe. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent_destinataire")
    private Agent agentDestinataire;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notification", length = 25, nullable = false)
    private TypeNotification typeNotification;

    @Column(name = "contenu")
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal", length = 10, nullable = false)
    private Canal canal;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_lecture", length = 10, nullable = false)
    private StatutLecture statutLecture = StatutLecture.non_lu;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    public enum TypeNotification {
        nouvelle_escalade, ticket_urgent, relance_sans_reponse, ticket_reassigne
    }

    public enum Canal {
        in_app, email, sms
    }

    public enum StatutLecture {
        non_lu, lu
    }
}
