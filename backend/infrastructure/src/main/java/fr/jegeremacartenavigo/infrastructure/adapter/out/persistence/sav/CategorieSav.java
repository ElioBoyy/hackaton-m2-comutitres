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

@Entity
@Table(name = "categorie_sav")
@Getter
@Setter
@NoArgsConstructor
public class CategorieSav {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie")
    private Integer idCategorie;

    @Column(name = "code", length = 40, nullable = false, unique = true)
    private String code;

    @Column(name = "libelle", length = 100, nullable = false)
    private String libelle;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_prioritaire", length = 20, nullable = false)
    private CanalPrioritaire canalPrioritaire;

    @Column(name = "description")
    private String description;

    public enum CanalPrioritaire {
        chatbot, email, telephone, chat_agent
    }
}
