package fr.jegeremacartenavigo.application.rag.ingestion;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.rag.model.DocumentCorpus;
import fr.jegeremacartenavigo.domain.rag.model.Fragment;
import fr.jegeremacartenavigo.domain.rag.port.EmbeddingPort;
import fr.jegeremacartenavigo.domain.rag.port.LecteurCorpus;
import fr.jegeremacartenavigo.domain.rag.port.MagasinVecteurs;
import fr.jegeremacartenavigo.domain.rag.service.DecoupeurMarkdown;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;

/**
 * Ingere le corpus : pour chaque document, calcule un checksum, saute s'il est
 * inchange (sauf {@code forcer}), sinon decoupe en fragments, vectorise (par
 * lots) et stocke. Idempotent grace au checksum.
 */
public final class IngererCorpusHandler implements CommandHandler<IngererCorpusCommand, IngestionResultat> {

    private static final Logger log = LoggerFactory.getLogger(IngererCorpusHandler.class);

    private final LecteurCorpus lecteur;
    private final DecoupeurMarkdown decoupeur;
    private final EmbeddingPort embedding;
    private final MagasinVecteurs magasin;
    private final int tailleLot;

    public IngererCorpusHandler(LecteurCorpus lecteur, DecoupeurMarkdown decoupeur,
                                EmbeddingPort embedding, MagasinVecteurs magasin, int tailleLot) {
        this.lecteur = lecteur;
        this.decoupeur = decoupeur;
        this.embedding = embedding;
        this.magasin = magasin;
        this.tailleLot = Math.max(1, tailleLot);
    }

    @Override
    public IngestionResultat handle(IngererCorpusCommand command) {
        List<DocumentCorpus> documents = lecteur.lireTout();
        log.info("Ingestion : {} document(s) lu(s) depuis le corpus", documents.size());

        // 1. Selection (checksum) + decoupage de tous les documents a (re)ingerer.
        List<APreparer> aPreparer = new ArrayList<>();
        int ignores = 0;
        for (DocumentCorpus document : documents) {
            String checksum = checksum(document.contenu());
            if (!command.forcer() && magasin.estInchange(document.cheminSource(), checksum)) {
                ignores++;
                continue;
            }
            List<Fragment> fragments = decoupeur.decouper(document.contenu());
            if (fragments.isEmpty()) {
                log.warn("Document sans fragment exploitable, ignore : {}", document.cheminSource());
                ignores++;
                continue;
            }
            aPreparer.add(new APreparer(document, checksum, fragments));
        }

        // 2. Vectorisation de TOUS les fragments du corpus en quelques gros lots
        //    (et non un appel HTTP par document : c'est la cle de la rapidite).
        List<String> textes = new ArrayList<>();
        for (APreparer a : aPreparer) {
            for (Fragment f : a.fragments()) {
                textes.add(f.contenu());
            }
        }
        log.info("Vectorisation de {} fragment(s) ({} document(s)) par lots de {}...",
                textes.size(), aPreparer.size(), tailleLot);
        List<float[]> vecteurs = vectoriserParLots(textes);

        // 3. Redistribution des vecteurs par document, puis stockage.
        int offset = 0;
        int traites = 0;
        int fragmentsCrees = 0;
        for (APreparer a : aPreparer) {
            int n = a.fragments().size();
            List<float[]> sousVecteurs = new ArrayList<>(vecteurs.subList(offset, offset + n));
            magasin.enregistrer(a.document(), a.checksum(), a.fragments(), sousVecteurs);
            offset += n;
            traites++;
            fragmentsCrees += n;
        }

        IngestionResultat resultat = new IngestionResultat(
                traites, ignores, fragmentsCrees,
                magasin.compterDocuments(), magasin.compterFragments());
        log.info("Ingestion terminee : {} traite(s), {} ignore(s), {} fragment(s) crees",
                traites, ignores, fragmentsCrees);
        return resultat;
    }

    private record APreparer(DocumentCorpus document, String checksum, List<Fragment> fragments) {
    }

    private List<float[]> vectoriserParLots(List<String> textes) {
        List<float[]> tous = new ArrayList<>(textes.size());
        for (int debut = 0; debut < textes.size(); debut += tailleLot) {
            int fin = Math.min(debut + tailleLot, textes.size());
            tous.addAll(embedding.vectoriserDocuments(textes.subList(debut, fin)));
        }
        return tous;
    }

    private static String checksum(String contenu) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(contenu.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponible", e);
        }
    }
}
