package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Passage;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class FiltreHorsSujetTest {

    private final FiltreHorsSujet filtre = new FiltreHorsSujet(0.35);

    private static Passage passage(double score) {
        return new Passage("doc.md", "Doc", null, null, "contenu", score);
    }

    @Test
    void sans_passage_la_question_est_hors_sujet() {
        assertThat(filtre.horsSujet(List.of())).isTrue();
        assertThat(filtre.horsSujet(null)).isTrue();
    }

    @Test
    void hors_sujet_si_meme_le_meilleur_passage_est_trop_loin() {
        assertThat(filtre.horsSujet(List.of(passage(0.20), passage(0.10)))).isTrue();
    }

    @Test
    void dans_le_perimetre_si_un_passage_depasse_le_seuil() {
        // Le meilleur passage suffit, meme si les autres sont faibles.
        assertThat(filtre.horsSujet(List.of(passage(0.50), passage(0.05)))).isFalse();
    }
}
