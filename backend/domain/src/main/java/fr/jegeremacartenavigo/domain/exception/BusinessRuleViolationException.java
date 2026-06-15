package fr.jegeremacartenavigo.domain.exception;

/**
 * Levee quand une invariante / regle metier est violee.
 * Exception generique fournie comme base ; les contextes metier peuvent en
 * deriver des exceptions plus specifiques.
 */
public class BusinessRuleViolationException extends DomainException {

    public BusinessRuleViolationException(String message) {
        super(message);
    }
}
