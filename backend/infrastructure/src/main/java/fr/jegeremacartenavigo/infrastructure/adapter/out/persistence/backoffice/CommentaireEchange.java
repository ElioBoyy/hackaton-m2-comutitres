package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

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

@Entity
@Table(name = "commentaire_echange")
@Getter
@Setter
@NoArgsConstructor
public class CommentaireEchange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_commentaire")
    private Integer idCommentaire;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_dossier", nullable = false)
    private Dossier dossier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent_auteur")
    private Agent agentAuteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur_auteur")
    private Utilisateur utilisateurAuteur;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation;

    @Column(name = "contenu", nullable = false)
    private String contenu;

    @Enumerated(EnumType.STRING)
    @Column(name = "visibilite", length = 20, nullable = false)
    private Visibilite visibilite = Visibilite.interne;

    public enum Visibilite {
        interne, visible_utilisateur
    }
}
