package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

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
@Table(name = "message_chat_agent")
@Getter
@Setter
@NoArgsConstructor
public class MessageChatAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message_chat")
    private Integer idMessageChat;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_session_chat", nullable = false)
    private SessionChatAgent sessionChat;

    @Column(name = "date_message", nullable = false)
    private LocalDateTime dateMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "auteur", length = 15, nullable = false)
    private Auteur auteur;

    @Column(name = "contenu", nullable = false)
    private String contenu;

    @Column(name = "lu", nullable = false)
    private boolean lu = false;

    @Column(name = "date_lecture")
    private LocalDateTime dateLecture;

    public enum Auteur {
        utilisateur, agent
    }
}
