package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.rag;

import fr.jegeremacartenavigo.domain.rag.model.DocumentCorpus;
import fr.jegeremacartenavigo.domain.rag.model.Fragment;
import fr.jegeremacartenavigo.domain.rag.model.Passage;
import fr.jegeremacartenavigo.domain.rag.port.MagasinVecteurs;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

/**
 * Stockage et recherche des vecteurs sur PostgreSQL + pgvector, en SQL natif
 * (les colonnes {@code vector} ne sont pas mappees par JPA). La similarite est
 * calculee via l'operateur de distance cosinus {@code <=>} (1 - distance).
 */
@Repository
public class PgVectorStore implements MagasinVecteurs {

    private final JdbcTemplate jdbc;

    public PgVectorStore(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public boolean estInchange(String cheminSource, String checksum) {
        Integer n = jdbc.queryForObject(
                "SELECT count(*) FROM rag_document WHERE chemin_source = ? AND checksum = ?",
                Integer.class, cheminSource, checksum);
        return n != null && n > 0;
    }

    @Override
    @Transactional
    public void enregistrer(DocumentCorpus document, String checksum,
                            List<Fragment> fragments, List<float[]> embeddings) {
        if (fragments.size() != embeddings.size()) {
            throw new IllegalArgumentException(
                    "fragments (" + fragments.size() + ") et embeddings ("
                            + embeddings.size() + ") de cardinalites differentes");
        }

        // Remplacement : la suppression du document supprime ses chunks (ON DELETE CASCADE).
        jdbc.update("DELETE FROM rag_document WHERE chemin_source = ?", document.cheminSource());

        Integer idDocument = jdbc.queryForObject("""
                        INSERT INTO rag_document (chemin_source, titre, url, categorie, checksum, nb_fragments)
                        VALUES (?, ?, ?, ?, ?, ?)
                        RETURNING id_document
                        """,
                Integer.class,
                document.cheminSource(), document.titre(), document.url(),
                document.categorie(), checksum, fragments.size());

        jdbc.batchUpdate("""
                        INSERT INTO rag_chunk (id_document, ordre, titre_section, contenu, nb_tokens_estimes, embedding)
                        VALUES (?, ?, ?, ?, ?, ?::vector)
                        """,
                new BatchPreparedStatementSetter() {
                    @Override
                    public void setValues(PreparedStatement ps, int i) throws SQLException {
                        Fragment f = fragments.get(i);
                        ps.setInt(1, idDocument);
                        ps.setInt(2, f.ordre());
                        ps.setString(3, f.titreSection());
                        ps.setString(4, f.contenu());
                        ps.setInt(5, f.nbTokensEstimes());
                        ps.setString(6, versVecteur(embeddings.get(i)));
                    }

                    @Override
                    public int getBatchSize() {
                        return fragments.size();
                    }
                });
    }

    @Override
    public List<Passage> rechercher(float[] embeddingRequete, int k) {
        String vecteur = versVecteur(embeddingRequete);
        return jdbc.query("""
                        SELECT d.chemin_source, d.titre, d.url, c.titre_section, c.contenu,
                               1 - (c.embedding <=> ?::vector) AS similarite
                        FROM rag_chunk c
                        JOIN rag_document d ON d.id_document = c.id_document
                        ORDER BY c.embedding <=> ?::vector
                        LIMIT ?
                        """,
                MAPPEUR, vecteur, vecteur, k);
    }

    @Override
    public long compterDocuments() {
        Long n = jdbc.queryForObject("SELECT count(*) FROM rag_document", Long.class);
        return n == null ? 0 : n;
    }

    @Override
    public long compterFragments() {
        Long n = jdbc.queryForObject("SELECT count(*) FROM rag_chunk", Long.class);
        return n == null ? 0 : n;
    }

    private static final RowMapper<Passage> MAPPEUR = (rs, n) -> new Passage(
            rs.getString("chemin_source"),
            rs.getString("titre"),
            rs.getString("url"),
            rs.getString("titre_section"),
            rs.getString("contenu"),
            rs.getDouble("similarite"));

    /** Serialise un vecteur au format texte pgvector : [v1,v2,...] (separateur decimal '.'). */
    private static String versVecteur(float[] valeurs) {
        StringBuilder sb = new StringBuilder(valeurs.length * 8 + 2);
        sb.append('[');
        for (int i = 0; i < valeurs.length; i++) {
            if (i > 0) {
                sb.append(',');
            }
            sb.append(Float.toString(valeurs[i]));
        }
        return sb.append(']').toString();
    }
}
