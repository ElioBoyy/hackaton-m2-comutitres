package fr.jegeremacartenavigo.domain.sav.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StatutReclamationTest {

    @Test
    void ouvert_et_reouvert_sont_groupes_ouvert() {
        assertThat(StatutReclamation.ouvert.groupe()).isEqualTo(GroupeStatutReclamation.ouvert);
        assertThat(StatutReclamation.reouvert.groupe()).isEqualTo(GroupeStatutReclamation.ouvert);
    }

    @Test
    void les_statuts_de_traitement_sont_groupes_en_cours() {
        assertThat(StatutReclamation.en_cours.groupe()).isEqualTo(GroupeStatutReclamation.en_cours);
        assertThat(StatutReclamation.en_attente_utilisateur.groupe()).isEqualTo(GroupeStatutReclamation.en_cours);
        assertThat(StatutReclamation.en_attente_interne.groupe()).isEqualTo(GroupeStatutReclamation.en_cours);
    }

    @Test
    void resolu_et_ferme_ont_leur_propre_groupe() {
        assertThat(StatutReclamation.resolu.groupe()).isEqualTo(GroupeStatutReclamation.resolu);
        assertThat(StatutReclamation.ferme.groupe()).isEqualTo(GroupeStatutReclamation.ferme);
    }

    @Test
    void chaque_statut_a_un_groupe() {
        for (StatutReclamation statut : StatutReclamation.values()) {
            assertThat(statut.groupe()).isNotNull();
        }
    }
}
