package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

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
@Table(name = "session_chatbot")
@Getter
@Setter
@NoArgsConstructor
public class SessionChatbot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_session")
    private Integer idSession;

    /** Null si non connecte. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur")
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier")
    private Dossier dossier;

    @Column(name = "date_debut", nullable = false)
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 20, nullable = false)
    private Statut statut = Statut.en_cours;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_entree", length = 10, nullable = false)
    private CanalEntree canalEntree;

    /** Categorie identifiee par l'IA. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie_detectee")
    private CategorieSav categorieDetectee;

    @Column(name = "resume_session")
    private String resumeSession;

    @Column(name = "score_satisfaction")
    private Integer scoreSatisfaction;

    public enum Statut {
        en_cours, resolue, escaladee, abandonnee
    }

    public enum CanalEntree {
        web, mobile, app
    }
}
