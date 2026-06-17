package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Citation;
import fr.jegeremacartenavigo.domain.rag.model.Passage;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ConstructeurPromptTest {

    private final ConstructeurPrompt prompt = new ConstructeurPrompt();

    private static Passage passage(String chemin, String titre) {
        return new Passage(chemin, titre, "https://x/" + chemin, "Section", "contenu de " + titre, 0.7);
    }

    @Test
    void instruction_systeme_impose_de_ne_pas_inventer() {
        assertThat(prompt.instructionSysteme())
                .containsIgnoringCase("uniquement")
                .containsIgnoringCase("n'invente");
    }

    @Test
    void message_avec_contexte_numerote_les_passages_et_finit_par_la_question() {
        String message = prompt.messageAvecContexte("Quel prix ?",
                List.of(passage("a.md", "A"), passage("b.md", "B")));

        assertThat(message).contains("[1] A").contains("[2] B");
        assertThat(message).contains("QUESTION : Quel prix ?");
    }

    @Test
    void citations_extraites_des_references_de_la_reponse() {
        List<Passage> passages = List.of(passage("a.md", "A"), passage("b.md", "B"), passage("c.md", "C"));

        List<Citation> citations = prompt.citationsUtilisees("D'apres [2] et [3], voici la reponse.", passages);

        assertThat(citations).extracting(Citation::cheminSource).containsExactly("b.md", "c.md");
        assertThat(citations).extracting(Citation::index).containsExactly(1, 2); // renumerotees
    }

    @Test
    void sans_reference_on_retombe_sur_tous_les_passages_dedupliques() {
        List<Passage> passages = List.of(passage("a.md", "A"), passage("a.md", "A"), passage("b.md", "B"));

        List<Citation> citations = prompt.citationsUtilisees("Reponse sans citation.", passages);

        assertThat(citations).extracting(Citation::cheminSource).containsExactly("a.md", "b.md");
    }

    @Test
    void les_references_hors_bornes_sont_ignorees() {
        List<Passage> passages = List.of(passage("a.md", "A"));

        List<Citation> citations = prompt.citationsUtilisees("Voir [5].", passages);

        // [5] invalide -> aucune reference valide -> repli sur tous les passages.
        assertThat(citations).extracting(Citation::cheminSource).containsExactly("a.md");
    }
}
