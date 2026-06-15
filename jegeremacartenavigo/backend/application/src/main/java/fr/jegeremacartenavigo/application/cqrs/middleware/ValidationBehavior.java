package fr.jegeremacartenavigo.application.cqrs.middleware;

import fr.jegeremacartenavigo.application.cqrs.Request;
import fr.jegeremacartenavigo.application.cqrs.Response;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;

import java.util.Set;

/**
 * Middleware de validation (order 100, execute apres le logging) : valide la
 * requete via Bean Validation (annotations {@code @NotNull}, {@code @Size}...
 * portees par les records de commande/query) avant qu'elle n'atteigne le handler.
 *
 * <p>Utilise uniquement l'API standard {@link Validator} (jakarta.validation).
 * L'implementation (Hibernate Validator) est fournie au runtime par la couche
 * bootstrap.
 */
public final class ValidationBehavior implements PipelineBehavior {

    private final Validator validator;

    public ValidationBehavior(Validator validator) {
        this.validator = validator;
    }

    @Override
    public int order() {
        return 100;
    }

    @Override
    public <R extends Response> R handle(Request<R> request, RequestNext<R> next) {
        Set<ConstraintViolation<Object>> violations = validator.validate(request);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
        return next.proceed();
    }
}
