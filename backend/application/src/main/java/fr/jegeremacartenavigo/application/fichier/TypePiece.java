package fr.jegeremacartenavigo.application.fichier;

/**
 * Categorie d'une piece justificative. Aligne sur les codes du referentiel
 * {@code TypePieceJustificative} (DataSeeder) pour rester coherent : un meme
 * code identifie le type au niveau du Dossier ET du stockage.
 *
 * <p>Quand le client uploade en specifiant un type (cf. POST /fichiers?type=...),
 * le storage range l'objet sous {@code users/{id}/{slug}/{horodatage}.{ext}}
 * (slug = code en minuscules avec '_' -> '-'). L'absence de type produit une
 * cle generique {@code users/{id}/{uuid}-{nom}}.
 */
public enum TypePiece {
    PIECE_IDENTITE,
    CERTIFICAT_SCOLARITE,
    NOTIFICATION_BOURSE;

    /** kebab-case, utilise comme segment dans la cle d'objet MinIO. */
    public String slug() {
        return name().toLowerCase().replace('_', '-');
    }

    /** Conversion inverse pour reconstruire le type a partir d'une cle. */
    public static TypePiece fromSlug(String slug) {
        if (slug == null) return null;
        for (TypePiece t : values()) {
            if (t.slug().equals(slug)) return t;
        }
        return null;
    }
}
