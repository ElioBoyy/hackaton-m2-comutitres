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

@Entity
@Table(name = "statut_dossier")
@Getter
@Setter
@NoArgsConstructor
public class StatutDossier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_statut")
    private Integer idStatut;

    @Column(name = "code", length = 40, nullable = false, unique = true)
    private String code;

    @Column(name = "libelle", length = 100, nullable = false)
    private String libelle;

    @Column(name = "ordre")
    private Integer ordre;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", length = 20, nullable = false)
    private Categorie categorie;

    public enum Categorie {
        en_cours, abouti, rejete, clos
    }
}
