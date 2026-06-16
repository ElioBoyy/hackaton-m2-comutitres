package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "type_abonnement")
@Getter
@Setter
@NoArgsConstructor
public class TypeAbonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_type_abonnement")
    private Integer idTypeAbonnement;

    @Column(name = "code", length = 30, nullable = false, unique = true)
    private String code;

    @Column(name = "libelle", length = 100, nullable = false)
    private String libelle;

    @Column(name = "categorie", length = 50)
    private String categorie;

    @Enumerated(EnumType.STRING)
    @Column(name = "periodicite", length = 30, nullable = false)
    private Periodicite periodicite;

    @Column(name = "tarif_plein", precision = 8, scale = 2)
    private BigDecimal tarifPlein;

    @Column(name = "description")
    private String description;

    @Column(name = "actif", nullable = false)
    private boolean actif = true;

    public enum Periodicite {
        journaliere, hebdomadaire, mensuelle, annuelle, sans_abonnement
    }
}
