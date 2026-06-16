package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "departement")
@Getter
@Setter
@NoArgsConstructor
public class Departement {

    @Id
    @Column(name = "id_departement", length = 3)
    private String idDepartement;

    @Column(name = "libelle", length = 50, nullable = false)
    private String libelle;

    @Column(name = "region", length = 50)
    private String region;
}
