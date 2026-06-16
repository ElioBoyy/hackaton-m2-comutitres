package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "contact_email")
@Getter
@Setter
@NoArgsConstructor
public class ContactEmail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contact_email")
    private Integer idContactEmail;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_ticket", nullable = false)
    private TicketSav ticket;

    @Column(name = "date_envoi", nullable = false)
    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    @Column(name = "expediteur", length = 15, nullable = false)
    private Expediteur expediteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent")
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @Column(name = "sujet", length = 200)
    private String sujet;

    @Column(name = "corps", nullable = false)
    private String corps;

    /** Liste des fichiers joints (jsonb brut). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pieces_jointes")
    private String piecesJointes;

    /** Pour les fils de reponse. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_email_parent")
    private ContactEmail emailParent;

    public enum Expediteur {
        utilisateur, agent
    }
}
