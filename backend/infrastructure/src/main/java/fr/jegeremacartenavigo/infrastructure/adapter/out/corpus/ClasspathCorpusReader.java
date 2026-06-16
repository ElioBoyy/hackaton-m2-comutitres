package fr.jegeremacartenavigo.infrastructure.adapter.out.corpus;

import fr.jegeremacartenavigo.domain.rag.model.DocumentCorpus;
import fr.jegeremacartenavigo.domain.rag.port.LecteurCorpus;
import fr.jegeremacartenavigo.infrastructure.config.RagProperties;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lit le corpus markdown depuis l'emplacement configure ({@code rag.corpus.location},
 * classpath par defaut, fichier en option). Le chemin relatif a la racine du
 * corpus sert d'identifiant stable du document.
 */
@Component
public class ClasspathCorpusReader implements LecteurCorpus {

    private final ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
    private final String location;

    public ClasspathCorpusReader(RagProperties properties) {
        this.location = properties.corpus().location();
    }

    @Override
    public List<DocumentCorpus> lireTout() {
        String racine = nomRacine(location);
        String marqueur = "/" + racine + "/";
        try {
            Resource[] ressources = resolver.getResources(motif());
            List<DocumentCorpus> documents = new ArrayList<>(ressources.length);
            for (Resource ressource : ressources) {
                if (!ressource.isReadable()) {
                    continue;
                }
                String contenu = ressource.getContentAsString(StandardCharsets.UTF_8);
                String chemin = cheminRelatif(ressource.getURI().toString(), marqueur, ressource.getFilename());
                documents.add(new DocumentCorpus(
                        chemin, titre(contenu, chemin), urlSource(contenu), categorie(chemin), contenu));
            }
            documents.sort((a, b) -> a.cheminSource().compareTo(b.cheminSource()));
            return documents;
        } catch (IOException e) {
            throw new UncheckedIOException("Lecture du corpus impossible : " + location, e);
        }
    }

    private String motif() {
        String base = location.endsWith("/") ? location : location + "/";
        String pattern = base + "**/*.md";
        // classpath: ne scanne qu'une racine ; classpath*: agrege toutes les racines.
        if (pattern.startsWith("classpath:")) {
            return "classpath*:" + pattern.substring("classpath:".length());
        }
        return pattern;
    }

    private static String nomRacine(String location) {
        String sansScheme = location.replaceFirst("^[a-zA-Z]+\\*?:", "");
        String sansSlash = sansScheme.replaceAll("/+$", "");
        int slash = sansSlash.lastIndexOf('/');
        return slash >= 0 ? sansSlash.substring(slash + 1) : sansSlash;
    }

    private static String cheminRelatif(String uri, String marqueur, String filename) {
        int idx = uri.lastIndexOf(marqueur);
        if (idx >= 0) {
            return uri.substring(idx + marqueur.length());
        }
        return filename == null ? uri : filename;
    }

    private static String categorie(String chemin) {
        int slash = chemin.lastIndexOf('/');
        return slash > 0 ? chemin.substring(0, slash) : null;
    }

    // Une URL http(s), bornee par espace / chevrons / parentheses (gere <url> et "url (titre)").
    private static final Pattern URL = Pattern.compile("https?://[^\\s<>)\\]]+");

    /**
     * Extrait l'URL source officielle depuis l'en-tete du document : on privilegie
     * une ligne contenant "URL" ou "Source", sinon la 1re URL rencontree dans les
     * premieres lignes. null si aucune (ex: documents de synthese sans source).
     */
    private static String urlSource(String contenu) {
        String repli = null;
        String[] lignes = contenu.split("\n", 60);
        int limite = Math.min(lignes.length, 50);
        for (int i = 0; i < limite; i++) {
            Matcher m = URL.matcher(lignes[i]);
            if (!m.find()) {
                continue;
            }
            String url = nettoyer(m.group());
            String ligneMin = lignes[i].toLowerCase(java.util.Locale.ROOT);
            if (ligneMin.contains("url") || ligneMin.contains("source")) {
                return url; // signal fort : ligne explicitement "URL source : ..."
            }
            if (repli == null) {
                repli = url;
            }
        }
        return repli;
    }

    /** Retire la ponctuation de fin parfois collee a l'URL (>, ), ., virgule...). */
    private static String nettoyer(String url) {
        return url.replaceAll("[).,;>\\]]+$", "");
    }

    private static String titre(String contenu, String chemin) {
        for (String ligne : contenu.split("\n", 50)) {
            String t = ligne.strip();
            if (t.startsWith("# ")) {
                return t.substring(2).strip();
            }
        }
        String nom = chemin.substring(chemin.lastIndexOf('/') + 1);
        return nom.endsWith(".md") ? nom.substring(0, nom.length() - 3) : nom;
    }
}
