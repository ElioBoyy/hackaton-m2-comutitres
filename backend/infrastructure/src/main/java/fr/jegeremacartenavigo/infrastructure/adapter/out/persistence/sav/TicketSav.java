package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
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

import java.time.LocalDateTime;

/** Cree a l'escalade chatbot, manuellement par l'utilisateur, ou par un agent. */
@Entity
@Table(name = "ticket_sav")
@Getter
@Setter
@NoArgsConstructor
public class TicketSav {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ticket")
    private Integer idTicket;

    @Column(name = "reference_ticket", length = 20, nullable = false, unique = true)
    private String referenceTicket;

    /** Null si ticket anonyme. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier")
    private Dossier dossier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_session_chatbot")
    private SessionChatbot sessionChatbot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_categorie", nullable = false)
    private CategorieSav categorie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent_assigne")
    private Agent agentAssigne;

    @Enumerated(EnumType.STRING)
    @Column(name = "origine", length = 20, nullable = false)
    private Origine origine;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_contact_souhaite", length = 15, nullable = false)
    private CanalContactSouhaite canalContactSouhaite = CanalContactSouhaite.indifferent;

    @Enumerated(EnumType.STRING)
    @Column(name = "priorite", length = 10, nullable = false)
    private Priorite priorite = Priorite.normale;

    @Column(name = "titre", length = 200, nullable = false)
    private String titre;

    @Column(name = "description_initiale")
    private String descriptionInitiale;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 25, nullable = false)
    private Statut statut = Statut.ouvert;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_premiere_prise_en_charge")
    private LocalDateTime datePremierePriseEnCharge;

    @Column(name = "date_resolution")
    private LocalDateTime dateResolution;

    @Column(name = "date_cloture")
    private LocalDateTime dateCloture;

    @Column(name = "score_satisfaction")
    private Integer scoreSatisfaction;

    public enum Origine {
        chatbot_escalade, utilisateur_direct, agent_backoffice, appel_telephone, email_entrant
    }

    public enum CanalContactSouhaite {
        email, telephone, chat_agent, indifferent
    }

    public enum Priorite {
        basse, normale, haute, urgente
    }

    public enum Statut {
        ouvert, en_cours, en_attente_utilisateur, en_attente_interne, resolu, ferme, reouvert
    }
}
