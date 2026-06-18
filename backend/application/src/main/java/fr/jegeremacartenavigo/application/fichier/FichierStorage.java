package fr.jegeremacartenavigo.application.fichier;

import java.io.InputStream;
import java.time.Instant;
import java.util.List;

/**
 * Port de stockage de fichiers (pieces justificatives uploadees par les
 * usagers connectes : CNI, certificat de scolarite, notification de bourse).
 * L'implementation concrete (MinIO/S3, cf. MinioFichierStorage) vit dans la
 * couche infrastructure - cette interface reste framework-free.
 *
 * <p>Le bucket est toujours prive : aucun acces direct depuis le navigateur,
 * c'est le backend qui re-stream l'objet via {@link #recuperer} apres verif
 * de l'auth et du prefixe utilisateur (cf. FichierController).
 */
public interface FichierStorage {

    /**
     * Depose un fichier dans le bucket prive, range sous un prefixe propre a
     * l'utilisateur connecte (cf. MinioFichierStorage : "users/{id}/...").
     *
     * @param idUtilisateur id de l'utilisateur qui depose (depuis le JWT)
     * @param nomOriginal   nom du fichier cote client (utilise pour suffixe + metadata)
     * @param contentType   type MIME (peut etre null/inconnu)
     * @param tailleOctets  taille (utilise par le SDK pour le upload streame)
     * @param contenu       flux du contenu (le port ne le ferme pas, c'est l'appelant)
     * @param type          categorie metier (CNI, certif scolarite, ...) ; null = upload
     *                      generique sans semantique. Quand renseigne, l'objet est range
     *                      sous {@code users/{id}/{type-slug}/...} pour qu'on puisse
     *                      retrouver son type au listing et afficher un libelle stable.
     * @return la cle d'objet generee, a stocker dans le Dossier (champ {@code chemin*})
     */
    String deposer(int idUtilisateur,
                   String nomOriginal,
                   String contentType,
                   long tailleOctets,
                   InputStream contenu,
                   TypePiece type);

    /**
     * Recupere le contenu d'un objet : flux + metadonnees minimales. C'est au
     * controller de fermer l'{@link Contenu#flux} (typiquement avec
     * try-with-resources ou via Spring qui ferme la Resource emise).
     *
     * <p>Pas de verification d'ownership ici : l'appelant doit s'assurer que
     * {@code cle} commence bien par le prefixe de l'utilisateur connecte
     * (cf. {@link #prefixeUtilisateur}).
     */
    Contenu recuperer(String cle);

    /**
     * Prefixe sous lequel sont rangees les pieces d'un utilisateur. Permet au
     * controller de verifier qu'une cle appartient bien au demandeur avant
     * de servir le contenu.
     */
    String prefixeUtilisateur(int idUtilisateur);

    /**
     * Liste toutes les pieces d'un utilisateur (objets du bucket sous
     * {@link #prefixeUtilisateur}). Le tri est laisse au front si besoin.
     */
    List<FichierEntree> lister(int idUtilisateur);

    /**
     * Vue d'un objet stocke, telle qu'exposee aux use cases / controllers.
     * Pas d'API MinIO ici : la couche application reste framework-free.
     *
     * @param cle           cle d'objet complete (incluant le prefixe utilisateur)
     * @param nomFichier    nom original tel que l'utilisateur l'a depose
     * @param type          categorie detectee depuis la cle (null si upload generique)
     * @param tailleOctets  taille de l'objet
     * @param dateDepot     timestamp de derniere modification cote MinIO
     */
    record FichierEntree(String cle, String nomFichier, TypePiece type, long tailleOctets, Instant dateDepot) {
    }

    /**
     * Contenu binaire d'un objet a streamer au client.
     *
     * @param flux          flux a lire puis fermer (transporte la connexion HTTP MinIO)
     * @param contentType   type MIME tel que MinIO l'a stocke (peut etre null/absent)
     * @param tailleOctets  taille pour fixer Content-Length (-1 si inconnue)
     * @param nomFichier    nom d'origine, pour Content-Disposition cote controller
     * @param type          categorie detectee depuis la cle (null si upload generique)
     */
    record Contenu(InputStream flux, String contentType, long tailleOctets, String nomFichier, TypePiece type) {
    }
}
