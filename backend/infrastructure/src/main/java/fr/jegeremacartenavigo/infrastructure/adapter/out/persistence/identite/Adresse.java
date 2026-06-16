package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.Departement;
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

@Entity
@Table(name = "adresse")
@Getter
@Setter
@NoArgsConstructor
public class Adresse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adresse")
    private Integer idAdresse;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_adresse", length = 20, nullable = false)
    private TypeAdresse typeAdresse;

    @Column(name = "numero_et_voie", length = 150, nullable = false)
    private String numeroEtVoie;

    @Column(name = "code_postal", length = 10, nullable = false)
    private String codePostal;

    @Column(name = "ville", length = 100, nullable = false)
    private String ville;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_departement", nullable = false)
    private Departement departement;

    @Column(name = "pays", length = 50, nullable = false)
    private String pays = "France";

    @Column(name = "principale", nullable = false)
    private boolean principale = false;

    public enum TypeAdresse {
        domicile, facturation
    }
}
