package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.RoleAgent;
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

@Entity
@Table(name = "agent")
@Getter
@Setter
@NoArgsConstructor
public class Agent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_agent")
    private Integer idAgent;

    @Column(name = "nom", length = 100, nullable = false)
    private String nom;

    @Column(name = "prenom", length = 100, nullable = false)
    private String prenom;

    @Column(name = "identifiant_pro", length = 50, nullable = false, unique = true)
    private String identifiantPro;

    @Column(name = "email", length = 150, nullable = false, unique = true)
    private String email;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_role", nullable = false)
    private RoleAgent role;

    @Column(name = "equipe", length = 100)
    private String equipe;

    @Column(name = "actif", nullable = false)
    private boolean actif = true;
}
