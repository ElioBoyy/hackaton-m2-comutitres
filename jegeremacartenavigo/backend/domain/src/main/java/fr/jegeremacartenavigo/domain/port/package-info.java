/**
 * Ports du domaine : interfaces que le domaine/l'application definissent et que
 * l'infrastructure implemente (repositories, services externes...).
 *
 * <p>Exemple de convention (a ajouter au fil des contextes metier) :
 * <pre>
 *   public interface CarteNavigoRepository {
 *       Optional&lt;CarteNavigo&gt; findById(CarteNavigoId id);
 *       void save(CarteNavigo carte);
 *   }
 * </pre>
 * L'implementation JPA correspondante ira dans la couche infrastructure.
 */
package fr.jegeremacartenavigo.domain.port;
