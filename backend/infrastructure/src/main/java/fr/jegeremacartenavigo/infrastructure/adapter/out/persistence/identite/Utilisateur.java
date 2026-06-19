package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite;

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

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
@Getter
@Setter
@NoArgsConstructor
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_utilisateur")
    private Integer idUtilisateur;

    @Column(name = "civilite", length = 10)
    private String civilite;

    @Column(name = "nom", length = 100, nullable = false)
    private String nom;

    @Column(name = "prenom", length = 100, nullable = false)
    private String prenom;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Column(name = "email", length = 150, nullable = false, unique = true)
    private String email;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "telephone_verifie", nullable = false)
    private boolean telephoneVerifie = false;

    @Column(name = "telephone_pin_id", length = 64)
    private String telephonePinId;

    @Column(name = "mot_de_passe_hash", length = 255, nullable = false)
    private String motDePasseHash;

    @Column(name = "date_creation_compte", nullable = false)
    private LocalDateTime dateCreationCompte;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut_compte", length = 20, nullable = false)
    private StatutCompte statutCompte = StatutCompte.actif;

    public enum StatutCompte {
        actif, inactif, suspendu
    }
}
