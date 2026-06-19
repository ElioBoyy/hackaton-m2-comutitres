package fr.jegeremacartenavigo.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration du service Infobip 2FA (OTP par SMS).
 *
 * <p>{@code applicationId} et {@code messageId} se creent une seule fois cote
 * Infobip. S'ils sont vides, l'adapter les cree au premier envoi et logue les
 * identifiants : a reporter ensuite dans la config (.env) pour un comportement
 * deterministe.
 *
 * @param apiKey          cle API Infobip (header {@code Authorization: App <cle>})
 * @param baseUrl         base de l'API du compte, ex. {@code https://xxxxx.api.infobip.com}
 * @param applicationId   id de l'application 2FA (vide = auto-creation)
 * @param messageId       id du template de message (vide = auto-creation)
 * @param from            expediteur affiche du SMS
 * @param pinLength       nombre de chiffres du code
 * @param messageText     gabarit du SMS, doit contenir le placeholder {@code {{pin}}}
 * @param applicationName nom de l'application creee si auto-creation
 */
@ConfigurationProperties(prefix = "infobip")
public record InfobipProperties(
        String apiKey,
        String baseUrl,
        String applicationId,
        String messageId,
        String from,
        int pinLength,
        String messageText,
        String applicationName
) {
}
