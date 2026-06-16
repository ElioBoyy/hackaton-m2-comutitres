package fr.jegeremacartenavigo.domain.auth.port;

/**
 * Port secondaire : hash et verification de mots de passe. Implementation
 * dans la couche infrastructure (BCrypt).
 */
public interface PasswordHasher {

    String hash(String motDePasseEnClair);

    boolean matches(String motDePasseEnClair, String hash);
}
