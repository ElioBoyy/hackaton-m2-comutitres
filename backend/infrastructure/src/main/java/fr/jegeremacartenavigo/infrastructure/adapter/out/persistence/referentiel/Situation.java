package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "situation")
@Getter
@Setter
@NoArgsConstructor
public class Situation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_situation")
    private Integer idSituation;

    @Column(name = "libelle", length = 100, nullable = false)
    private String libelle;

    @Column(name = "description")
    private String description;
}
