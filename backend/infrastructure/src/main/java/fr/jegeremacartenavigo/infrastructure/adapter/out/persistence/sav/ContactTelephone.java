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

@Entity
@Table(name = "contact_telephone")
@Getter
@Setter
@NoArgsConstructor
public class ContactTelephone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contact_tel")
    private Integer idContactTel;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_ticket", nullable = false)
    private TicketSav ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent")
    private Agent agent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @Column(name = "date_appel", nullable = false)
    private LocalDateTime dateAppel;

    @Column(name = "duree_secondes")
    private Integer dureeSecondes;

    @Enumerated(EnumType.STRING)
    @Column(name = "sens", length = 10, nullable = false)
    private Sens sens;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 15, nullable = false)
    private Statut statut;

    @Column(name = "compte_rendu")
    private String compteRendu;

    @Column(name = "enregistrement_url", length = 255)
    private String enregistrementUrl;

    public enum Sens {
        entrant, sortant
    }

    public enum Statut {
        decroche, non_repondu, messagerie
    }
}
