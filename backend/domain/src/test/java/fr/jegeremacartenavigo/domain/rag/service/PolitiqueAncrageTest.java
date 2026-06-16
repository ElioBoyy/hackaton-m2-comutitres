package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Passage;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PolitiqueAncrageTest {

    private static Passage passage(double score) {
        return new Passage("doc.md", "Doc", null, null, "contenu", score);
    }

    @Test
    void garde_seulement_les_passages_au_dessus_du_seuil() {
        PolitiqueAncrage politique = new PolitiqueAncrage(0.5, 1);

        List<Passage> pertinents = politique.pertinents(
                List.of(passage(0.6), passage(0.49), passage(0.5)));

        assertThat(pertinents).extracting(Passage::score).containsExactly(0.6, 0.5);
    }

    @Test
    void est_ancre_si_assez_de_passages_pertinents() {
        PolitiqueAncrage politique = new PolitiqueAncrage(0.5, 2);

        assertThat(politique.estAncre(List.of(passage(0.7), passage(0.55)))).isTrue();
        assertThat(politique.estAncre(List.of(passage(0.7), passage(0.4)))).isFalse();
    }

    @Test
    void question_hors_corpus_quand_tout_est_sous_le_seuil() {
        PolitiqueAncrage politique = new PolitiqueAncrage(0.45, 1);

        assertThat(politique.estAncre(List.of(passage(0.2), passage(0.1)))).isFalse();
        assertThat(politique.pertinents(List.of())).isEmpty();
        assertThat(politique.estAncre(List.of())).isFalse();
    }

    @Test
    void min_fragments_doit_etre_au_moins_un() {
        assertThatThrownBy(() -> new PolitiqueAncrage(0.5, 0))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
