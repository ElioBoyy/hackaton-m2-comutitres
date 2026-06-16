package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

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

import java.time.LocalTime;

/** Plages horaires des canaux humains, affichees par le chatbot avant une redirection. */
@Entity
@Table(name = "plage_disponibilite_canal")
@Getter
@Setter
@NoArgsConstructor
public class PlageDisponibiliteCanal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_plage")
    private Integer idPlage;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal", length = 20, nullable = false)
    private Canal canal;

    @Enumerated(EnumType.STRING)
    @Column(name = "jour_semaine", length = 10, nullable = false)
    private JourSemaine jourSemaine;

    @Column(name = "heure_debut", nullable = false)
    private LocalTime heureDebut;

    @Column(name = "heure_fin", nullable = false)
    private LocalTime heureFin;

    @Column(name = "numero_ou_adresse", length = 150)
    private String numeroOuAdresse;

    @Column(name = "actif", nullable = false)
    private boolean actif = true;

    public enum Canal {
        telephone, chat_agent, email
    }

    public enum JourSemaine {
        lundi, mardi, mercredi, jeudi, vendredi, samedi, dimanche
    }
}
