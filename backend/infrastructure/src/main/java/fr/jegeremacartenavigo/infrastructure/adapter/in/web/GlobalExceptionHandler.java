package fr.jegeremacartenavigo.infrastructure.adapter.in.web;

import fr.jegeremacartenavigo.domain.exception.DomainException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.List;

/**
 * Traduit les exceptions transverses en reponses HTTP normalisees (RFC 7807,
 * {@link ProblemDetail}). C'est ici - et seulement ici - que le metier rencontre
 * HTTP.
 *
 * <p>Aucun endpoint metier n'est fourni (setup "sans exemples") : ce conseiller
 * s'appliquera automatiquement aux controllers que vous ajouterez.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DomainException.class)
    public ProblemDetail handleDomain(DomainException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNPROCESSABLE_CONTENT, ex.getMessage());
        problem.setTitle("Regle metier violee");
        return problem;
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleValidation(ConstraintViolationException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "La requete est invalide");
        problem.setTitle("Validation echouee");
        List<String> violations = ex.getConstraintViolations().stream()
                .map(GlobalExceptionHandler::format)
                .toList();
        problem.setProperty("violations", violations);
        return problem;
    }

    private static String format(ConstraintViolation<?> violation) {
        return violation.getPropertyPath() + " : " + violation.getMessage();
    }
}
