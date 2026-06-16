package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

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
@Table(name = "relation_utilisateur")
@Getter
@Setter
@NoArgsConstructor
public class RelationUtilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relation")
    private Integer idRelation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur_principal", nullable = false)
    private Utilisateur utilisateurPrincipal;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur_lie", nullable = false)
    private Utilisateur utilisateurLie;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_relation", length = 20, nullable = false)
    private TypeRelation typeRelation;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 10, nullable = false)
    private Statut statut = Statut.actif;

    public enum TypeRelation {
        parent_tuteur, mandataire, conjoint
    }

    public enum Statut {
        actif, inactif
    }
}
