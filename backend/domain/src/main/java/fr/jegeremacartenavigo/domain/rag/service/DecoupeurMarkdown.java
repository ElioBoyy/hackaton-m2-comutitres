package fr.jegeremacartenavigo.domain.rag.service;

import fr.jegeremacartenavigo.domain.rag.model.Fragment;

import java.util.ArrayList;
import java.util.List;

/**
 * Decoupe un document markdown en fragments de taille cible, avec chevauchement,
 * en conservant le chemin des titres (h1 > h2 > ...) actif au debut de chaque
 * fragment. Pur Java, deterministe, testable sans dependance externe.
 *
 * <p>Strategie : accumulation gloutonne ligne par ligne jusqu'a la taille cible
 * (en caracteres), puis on demarre le fragment suivant en reprenant les derniers
 * {@code chevauchement} caracteres pour ne pas couper le contexte net.
 */
public final class DecoupeurMarkdown {

    private final int tailleCible;
    private final int chevauchement;

    /**
     * @param tailleCible   taille visee d'un fragment, en caracteres (> 0)
     * @param chevauchement nombre de caracteres repris d'un fragment au suivant
     *                      (>= 0 et &lt; tailleCible)
     */
    public DecoupeurMarkdown(int tailleCible, int chevauchement) {
        if (tailleCible <= 0) {
            throw new IllegalArgumentException("tailleCible doit etre > 0");
        }
        if (chevauchement < 0 || chevauchement >= tailleCible) {
            throw new IllegalArgumentException("chevauchement doit etre dans [0, tailleCible[");
        }
        this.tailleCible = tailleCible;
        this.chevauchement = chevauchement;
    }

    public List<Fragment> decouper(String markdown) {
        List<Fragment> fragments = new ArrayList<>();
        if (markdown == null || markdown.isBlank()) {
            return fragments;
        }

        String[] niveaux = new String[6]; // titres h1..h6 courants
        StringBuilder buffer = new StringBuilder();
        // Section retenue pour le fragment courant. Tant qu'on n'a pas vu de
        // contenu (que des titres/blancs), elle suit le titre le plus profond ;
        // elle se fige a la 1re ligne de contenu (la section a laquelle ce
        // contenu appartient reellement).
        String sectionFragment = null;
        boolean contenuVu = false;
        int ordre = 0;

        for (String ligne : markdown.split("\n", -1)) {
            boolean estTitre = majTitres(ligne, niveaux);

            if (!buffer.isEmpty()
                    && buffer.length() + ligne.length() + 1 > tailleCible) {
                ajouter(fragments, ordre++, sectionFragment, buffer.toString());
                buffer = new StringBuilder(queue(buffer.toString(), chevauchement));
                sectionFragment = cheminTitres(niveaux);
                contenuVu = false;
            }

            if (buffer.isEmpty()) {
                sectionFragment = cheminTitres(niveaux);
                contenuVu = false;
            }

            if (!contenuVu) {
                if (estTitre) {
                    // titre avant tout contenu -> on descend dans la hierarchie
                    sectionFragment = cheminTitres(niveaux);
                } else if (!ligne.isBlank()) {
                    // 1re ligne de contenu : on fige la section sur l'etat courant
                    sectionFragment = cheminTitres(niveaux);
                    contenuVu = true;
                }
            }

            if (!buffer.isEmpty()) {
                buffer.append('\n');
            }
            buffer.append(ligne);
        }

        ajouter(fragments, ordre, sectionFragment, buffer.toString());
        return fragments;
    }

    /**
     * Si la ligne est un titre markdown (# .. ######), met a jour la pile de
     * titres (positionne le niveau, oublie les niveaux plus profonds) et renvoie
     * vrai ; sinon renvoie faux.
     */
    private static boolean majTitres(String ligne, String[] niveaux) {
        int diese = 0;
        while (diese < ligne.length() && ligne.charAt(diese) == '#') {
            diese++;
        }
        if (diese >= 1 && diese <= 6 && diese < ligne.length() && ligne.charAt(diese) == ' ') {
            niveaux[diese - 1] = ligne.substring(diese + 1).trim();
            for (int i = diese; i < niveaux.length; i++) {
                niveaux[i] = null;
            }
            return true;
        }
        return false;
    }

    private static String cheminTitres(String[] niveaux) {
        StringBuilder sb = new StringBuilder();
        for (String n : niveaux) {
            if (n != null && !n.isBlank()) {
                if (!sb.isEmpty()) {
                    sb.append(" > ");
                }
                sb.append(n);
            }
        }
        return sb.isEmpty() ? null : sb.toString();
    }

    private static String queue(String texte, int n) {
        if (n <= 0 || texte.length() <= n) {
            return n <= 0 ? "" : texte;
        }
        return texte.substring(texte.length() - n);
    }

    private static void ajouter(List<Fragment> cible, int ordre, String section, String contenu) {
        String propre = contenu.strip();
        if (propre.isBlank()) {
            return;
        }
        cible.add(new Fragment(ordre, section, propre, estimerTokens(propre)));
    }

    /** Estimation grossiere : ~4 caracteres par token. */
    private static int estimerTokens(String texte) {
        return Math.max(1, texte.length() / 4);
    }
}
