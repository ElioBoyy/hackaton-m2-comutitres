package fr.jegeremacartenavigo.infrastructure.config.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;

/**
 * Convertit le claim {@code type} (client|agent) du JWT en authority Spring
 * Security ({@code ROLE_CLIENT}/{@code ROLE_AGENT}), pour restreindre certaines
 * routes (ex: /dossiers/**) aux agents backoffice.
 */
public class JwtRoleConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String type = jwt.getClaimAsString("type");
        String role = "agent".equals(type) ? "ROLE_AGENT" : "ROLE_CLIENT";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(role));
        return new JwtAuthenticationToken(jwt, authorities);
    }
}
