package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

/**
 * Exactement un des deux champs {@code typeAbonnement} / {@code critere} est
 * renseigne (contrainte portee par le CHECK SQL {@code chk_piece_requise_exactement_un_parent}).
 */
@Entity
@Table(name = "piece_requise")
@Getter
@Setter
@NoArgsConstructor
public class PieceRequise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_piece_requise")
    private Integer idPieceRequise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_type_abonnement")
    private TypeAbonnement typeAbonnement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_critere")
    private CritereEligibilite critere;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_type_piece", nullable = false)
    private TypePieceJustificative typePiece;

    @Column(name = "obligatoire", nullable = false)
    private boolean obligatoire = true;

    @Column(name = "commentaire", length = 200)
    private String commentaire;
}
