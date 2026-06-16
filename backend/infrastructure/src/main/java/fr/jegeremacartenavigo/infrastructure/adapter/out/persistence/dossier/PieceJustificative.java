package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypePieceJustificative;
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
@Table(name = "piece_justificative")
@Getter
@Setter
@NoArgsConstructor
public class PieceJustificative {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_piece")
    private Integer idPiece;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_dossier", nullable = false)
    private Dossier dossier;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_type_piece", nullable = false)
    private TypePieceJustificative typePiece;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur_depot", nullable = false)
    private Utilisateur utilisateurDepot;

    @Column(name = "chemin_fichier", length = 255, nullable = false)
    private String cheminFichier;

    @Column(name = "date_depot", nullable = false)
    private LocalDateTime dateDepot;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_validation", length = 20, nullable = false)
    private StatutValidation statutValidation = StatutValidation.en_attente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_agent_validation")
    private Agent agentValidation;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "motif_rejet")
    private String motifRejet;

    public enum StatutValidation {
        en_attente, validee, rejetee
    }
}
