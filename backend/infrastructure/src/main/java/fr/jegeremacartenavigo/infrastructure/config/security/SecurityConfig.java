package fr.jegeremacartenavigo.infrastructure.config.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

import static org.springframework.security.config.Customizer.withDefaults;

/**
 * Configuration Spring Security : resource server JWT stateless. Suit la doc
 * Spring Security 6 (HttpSecurity + oauth2ResourceServer().jwt()).
 *
 * <p>{@code /auth/register} et {@code /auth/login} sont publics, le reste est
 * authentifie. CORS est branche sur la chaine globale {@code CorsConfig}.
 */
@Configuration
public class SecurityConfig {

    private final JwtProperties jwt;

    public SecurityConfig(JwtProperties jwt) {
        this.jwt = jwt;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/auth/register", "/auth/login")
                        .permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        // Chat RAG (bloquant + streaming + escalade) : ouvert a tous
                        // (widget public, sans compte). L'admin RAG (ingestion) reste authentifie.
                        .requestMatchers("/api/chat/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/referentiel/**").permitAll()
                        .requestMatchers("/auth/agent/me").hasAuthority("ROLE_AGENT")
                        // backoffice : liste paginée et counts réservés aux agents
                        .requestMatchers(HttpMethod.GET, "/dossiers", "/dossiers/counts").hasAuthority("ROLE_AGENT")
                        // clients : lecture d'un dossier, création, résiliation, soumission
                        .requestMatchers(HttpMethod.GET, "/dossiers/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/dossiers").authenticated()
                        .requestMatchers(HttpMethod.POST, "/dossiers/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/dossiers/**").authenticated()
                        .requestMatchers(
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs",
                                "/v3/api-docs/**"
                        ).permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(o -> o.jwt(jwt -> jwt.jwtAuthenticationConverter(new JwtRoleConverter())))
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(secretKey()));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(secretKey())
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
    }

    private SecretKeySpec secretKey() {
        byte[] bytes = jwt.secret().getBytes(StandardCharsets.UTF_8);
        return new SecretKeySpec(bytes, "HmacSHA256");
    }
}
