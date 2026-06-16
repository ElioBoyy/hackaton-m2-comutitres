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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_chatbot")
@Getter
@Setter
@NoArgsConstructor
public class MessageChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_message")
    private Integer idMessage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_session", nullable = false)
    private SessionChatbot session;

    @Column(name = "date_message", nullable = false)
    private LocalDateTime dateMessage;

    @Enumerated(EnumType.STRING)
    @Column(name = "auteur", length = 15, nullable = false)
    private Auteur auteur;

    @Column(name = "contenu", nullable = false)
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_contenu", length = 20, nullable = false)
    private TypeContenu typeContenu;

    /** Options proposees, liens de redirection, etc. (jsonb brut). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata")
    private String metadata;

    public enum Auteur {
        utilisateur, bot
    }

    public enum TypeContenu {
        texte, choix_rapide, redirection, action_declenchee
    }
}
