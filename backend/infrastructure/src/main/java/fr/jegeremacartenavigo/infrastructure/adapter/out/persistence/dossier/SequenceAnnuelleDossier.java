package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "sequence_annuelle_dossier")
@Getter
@Setter
@NoArgsConstructor
public class SequenceAnnuelleDossier {

    @Id
    @Column(name = "annee")
    private Integer annee;

    @Column(name = "dernier_numero", nullable = false)
    private Integer dernierNumero = 0;
}
