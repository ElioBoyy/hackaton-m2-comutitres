package fr.jegeremacartenavigo.infrastructure.adapter.out.security;

import fr.jegeremacartenavigo.domain.auth.port.PasswordHasher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BCryptPasswordHasherAdapter implements PasswordHasher {

    private final PasswordEncoder encoder;

    public BCryptPasswordHasherAdapter(PasswordEncoder encoder) {
        this.encoder = encoder;
    }

    @Override
    public String hash(String motDePasseEnClair) {
        return encoder.encode(motDePasseEnClair);
    }

    @Override
    public boolean matches(String motDePasseEnClair, String hash) {
        return encoder.matches(motDePasseEnClair, hash);
    }
}
