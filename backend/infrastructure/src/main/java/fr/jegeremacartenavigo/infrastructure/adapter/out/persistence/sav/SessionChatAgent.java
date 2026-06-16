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

import java.time.LocalDateTime;

/** Chat en direct entre un utilisateur et un agent humain (distinct du chatbot IA). */
@Entity
@Table(name = "session_chat_agent")
@Getter
@Setter
@NoArgsConstructor
public class SessionChatAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_session_chat")
    private Integer idSessionChat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_ticket", nullable = false)
    private TicketSav ticket;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_agent", nullable = false)
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 15, nullable = false)
    private Statut statut = Statut.en_attente;

    @Column(name = "temps_attente_secondes")
    private Integer tempsAttenteSecondes;

    public enum Statut {
        en_attente, en_cours, terminee
    }
}
