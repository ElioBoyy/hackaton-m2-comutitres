package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Fragment;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DecoupeurMarkdownTest {

    @Test
    void contenu_vide_donne_aucun_fragment() {
        DecoupeurMarkdown decoupeur = new DecoupeurMarkdown(1200, 200);
        assertThat(decoupeur.decouper("")).isEmpty();
        assertThat(decoupeur.decouper("   \n  ")).isEmpty();
        assertThat(decoupeur.decouper(null)).isEmpty();
    }

    @Test
    void petit_document_donne_un_seul_fragment_avec_le_chemin_de_titres() {
        DecoupeurMarkdown decoupeur = new DecoupeurMarkdown(1200, 200);

        List<Fragment> fragments = decoupeur.decouper("""
                # Navigo Annuel
                ## Tarifs
                Le forfait coute 998,80 euros par an.
                """);

        assertThat(fragments).hasSize(1);
        Fragment f = fragments.getFirst();
        assertThat(f.titreSection()).isEqualTo("Navigo Annuel > Tarifs");
        assertThat(f.contenu()).contains("998,80");
        assertThat(f.nbTokensEstimes()).isPositive();
    }

    @Test
    void gros_document_est_decoupe_en_plusieurs_fragments_avec_chevauchement() {
        DecoupeurMarkdown decoupeur = new DecoupeurMarkdown(120, 40);
        StringBuilder sb = new StringBuilder("# Titre\n");
        for (int i = 0; i < 40; i++) {
            sb.append("ligne numero ").append(i).append(" avec du contenu\n");
        }

        List<Fragment> fragments = decoupeur.decouper(sb.toString());

        assertThat(fragments).hasSizeGreaterThan(1);
        // L'ordre est croissant et continu.
        for (int i = 0; i < fragments.size(); i++) {
            assertThat(fragments.get(i).ordre()).isEqualTo(i);
        }
        // Le chevauchement fait que la fin d'un fragment se retrouve au debut du suivant.
        String fin = fragments.get(0).contenu();
        String suite = fragments.get(1).contenu();
        String tail = fin.substring(Math.max(0, fin.length() - 20));
        assertThat(suite).contains(tail);
    }

    @Test
    void les_sous_titres_plus_profonds_sont_oublies_quand_on_remonte() {
        // Petite taille cible pour forcer la separation en plusieurs fragments.
        DecoupeurMarkdown decoupeur = new DecoupeurMarkdown(40, 0);

        List<Fragment> fragments = decoupeur.decouper("""
                # A
                ## B
                texte b assez long pour remplir
                # C
                texte c assez long aussi ici
                """);

        Fragment fragmentB = fragments.stream()
                .filter(f -> f.contenu().contains("texte b")).findFirst().orElseThrow();
        Fragment fragmentC = fragments.stream()
                .filter(f -> f.contenu().contains("texte c")).findFirst().orElseThrow();

        assertThat(fragmentB.titreSection()).isEqualTo("A > B");
        // Apres "# C", le sous-titre "B" est oublie : la section est "C", pas "A > B > ...".
        assertThat(fragmentC.titreSection()).isEqualTo("C");
    }

    @Test
    void parametres_invalides_rejetes() {
        assertThatThrownBy(() -> new DecoupeurMarkdown(0, 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DecoupeurMarkdown(100, 100))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new DecoupeurMarkdown(100, -1))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
