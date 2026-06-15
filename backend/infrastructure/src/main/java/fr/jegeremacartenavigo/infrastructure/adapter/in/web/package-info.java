/**
 * Adapters ENTRANTS : controllers REST (driving adapters).
 *
 * <p>Convention : un controller ne contient aucune logique metier. Il
 * desserialise la requete HTTP en Command/Query, appelle le bus
 * ({@code CommandBus} / {@code QueryBus}) puis serialise la Response. Exemple :
 * <pre>
 *   &#64;RestController
 *   &#64;RequestMapping("/api/cartes")
 *   class CarteController {
 *       private final CommandBus commandBus;
 *       // ... POST -&gt; commandBus.send(new CreerCarteCommand(...));
 *   }
 * </pre>
 */
package fr.jegeremacartenavigo.infrastructure.adapter.in.web;
