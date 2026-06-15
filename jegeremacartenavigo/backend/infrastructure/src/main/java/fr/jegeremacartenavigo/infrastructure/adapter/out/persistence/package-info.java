/**
 * Adapters SORTANTS de persistance (driven adapters).
 *
 * <p>Contient les entites JPA ({@code @Entity}), les repositories Spring Data et
 * les implementations des ports definis dans {@code fr.jegeremacartenavigo.domain.port}.
 * Les entites JPA sont DISTINCTES des objets du domaine : on mappe explicitement
 * de l'un vers l'autre pour ne pas contaminer le domaine avec des contraintes ORM.
 *
 * <p>Scanne par {@code PersistenceConfig} ({@code @EntityScan} + {@code @EnableJpaRepositories}).
 */
package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence;
