package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.Situation;
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

import java.time.LocalDate;

@Entity
@Table(name = "utilisateur_situation")
@Getter
@Setter
@NoArgsConstructor
public class UtilisateurSituation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur_situation")
    private Integer idUtilisateurSituation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_situation", nullable = false)
    private Situation situation;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 20, nullable = false)
    private Source source;

    /** Dossier dans lequel la situation a ete prouvee, si validee officiellement. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_dossier_justificatif")
    private Dossier dossierJustificatif;

    public enum Source {
        auto_declare, valide_via_dossier
    }
}
