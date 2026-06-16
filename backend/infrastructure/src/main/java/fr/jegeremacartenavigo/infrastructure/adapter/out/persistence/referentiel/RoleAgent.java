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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "role_agent")
@Getter
@Setter
@NoArgsConstructor
public class RoleAgent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_role")
    private Integer idRole;

    @Column(name = "libelle", length = 50, nullable = false)
    private String libelle;

    /** Liste JSON des actions autorisees, stockee telle quelle (jsonb). */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "permissions")
    private String permissions;
}
