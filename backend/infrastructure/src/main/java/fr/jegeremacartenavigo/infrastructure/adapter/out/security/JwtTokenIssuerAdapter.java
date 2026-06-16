package fr.jegeremacartenavigo.infrastructure.adapter.out.security;

import fr.jegeremacartenavigo.domain.auth.model.UtilisateurAuth;
import fr.jegeremacartenavigo.domain.auth.port.TokenIssuer;
import fr.jegeremacartenavigo.infrastructure.config.security.JwtProperties;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

/**
 * Adapter Nimbus : emet un JWT HS256 dont {@code sub} = id utilisateur et le
 * claim {@code email} = adresse email. Le filtre Spring Security
 * {@code oauth2ResourceServer().jwt()} le valide a l'arrivee.
 */
@Component
public class JwtTokenIssuerAdapter implements TokenIssuer {

    private final JwtEncoder encoder;
    private final JwtProperties properties;

    public JwtTokenIssuerAdapter(JwtEncoder encoder, JwtProperties properties) {
        this.encoder = encoder;
        this.properties = properties;
    }

    @Override
    public String issue(UtilisateurAuth utilisateur) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(ttlSeconds()))
                .subject(String.valueOf(utilisateur.id()))
                .claim("email", utilisateur.email())
                .build();
        JwsHeader header = JwsHeader.with(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    @Override
    public long ttlSeconds() {
        return Duration.ofMinutes(properties.expiresMinutes()).toSeconds();
    }
}
