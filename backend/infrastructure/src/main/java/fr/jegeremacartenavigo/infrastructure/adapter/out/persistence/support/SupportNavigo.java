package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.support;

import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
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
@Table(name = "support_navigo")
@Getter
@Setter
@NoArgsConstructor
public class SupportNavigo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_support")
    private Integer idSupport;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_utilisateur_porteur", nullable = false)
    private Utilisateur utilisateurPorteur;

    @Column(name = "numero_support", length = 30, nullable = false, unique = true)
    private String numeroSupport;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_support", length = 30, nullable = false)
    private TypeSupport typeSupport;

    @Column(name = "date_emission", nullable = false)
    private LocalDate dateEmission;

    @Column(name = "date_expiration")
    private LocalDate dateExpiration;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", length = 20, nullable = false)
    private Statut statut = Statut.actif;

    public enum TypeSupport {
        carte_physique, dematerialise_smartphone, autre_support
    }

    public enum Statut {
        actif, opposition, perdu, vole, expire, remplace
    }
}
