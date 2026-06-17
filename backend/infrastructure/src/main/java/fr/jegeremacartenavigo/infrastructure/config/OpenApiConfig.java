package fr.jegeremacartenavigo.infrastructure.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Declare le schema de securite "bearerAuth" (JWT) pour Swagger UI : sans
 * cela, aucun bouton "Authorize" n'apparait et les routes protegees ne
 * peuvent pas etre testees directement depuis l'UI.
 *
 * <p>{@code security} sur {@code @OpenAPIDefinition} rend bearerAuth
 * applicable par defaut a TOUTES les operations (le token saisi via
 * "Authorize" est alors envoye sur chaque requete) - sans ca, seules les
 * operations annotees individuellement avec {@code @SecurityRequirement}
 * recoivent le token, et le reste echoue en 401 meme apres "Authorize". Les
 * routes reellement publiques (auth/register, auth/login) doivent surcharger
 * ce defaut avec {@code @SecurityRequirements} (liste vide) sur leur methode.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(title = "jegeremacartenavigo API", version = "v1"),
        security = @SecurityRequirement(name = "bearerAuth")
)
@SecurityScheme(
        name = "bearerAuth",
        type = io.swagger.v3.oas.annotations.enums.SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
