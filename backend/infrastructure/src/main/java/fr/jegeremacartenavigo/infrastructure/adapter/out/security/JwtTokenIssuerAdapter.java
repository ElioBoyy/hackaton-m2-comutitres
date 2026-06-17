package fr.jegeremacartenavigo.infrastructure.adapter.out.security;

import fr.jegeremacartenavigo.domain.auth.model.CompteAuth;
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
 * Adapter Nimbus : emet un JWT HS256 dont {@code sub} = id du principal et les
 * claims {@code email} et {@code type} (client|agent) identifient qui s'est
 * authentifie. Le claim {@code type} est converti en authority Spring Security
 * (cf. {@code JwtRoleConverter}) pour restreindre certaines routes aux agents.
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
        return issue(utilisateur.id(), utilisateur.email(), "client");
    }

    @Override
    public String issue(CompteAuth compte) {
        return issue(compte.id(), compte.email(), compte.role().name().toLowerCase());
    }

    private String issue(Integer id, String email, String type) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(ttlSeconds()))
                .subject(String.valueOf(id))
                .claim("email", email)
                .claim("type", type)
                .build();
        JwsHeader header = JwsHeader.with(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    @Override
    public long ttlSeconds() {
        return Duration.ofMinutes(properties.expiresMinutes()).toSeconds();
    }
}
