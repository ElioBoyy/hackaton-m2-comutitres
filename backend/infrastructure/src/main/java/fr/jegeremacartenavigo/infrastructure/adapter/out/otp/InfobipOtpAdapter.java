package fr.jegeremacartenavigo.infrastructure.adapter.out.otp;

import fr.jegeremacartenavigo.domain.identite.exception.ServiceOtpIndisponibleException;
import fr.jegeremacartenavigo.domain.identite.model.ResultatVerification;
import fr.jegeremacartenavigo.domain.identite.port.ServiceOtp;
import fr.jegeremacartenavigo.infrastructure.config.InfobipProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

/**
 * Adapter sortant Infobip 2FA (OTP par SMS), suivant le meme pattern RestClient
 * que les adapters IA (cf. {@code VoyageEmbeddingAdapter}).
 *
 * <p>L'application 2FA et son template de message sont provisionnes une seule
 * fois : pris depuis la config s'ils sont fournis, sinon crees au premier envoi
 * et logues (a reporter ensuite dans la config).
 */
@Component
public class InfobipOtpAdapter implements ServiceOtp {

    private static final Logger log = LoggerFactory.getLogger(InfobipOtpAdapter.class);

    private final RestClient client;
    private final InfobipProperties props;
    private final boolean cleAbsente;

    private volatile String applicationId;
    private volatile String messageId;

    public InfobipOtpAdapter(InfobipProperties props) {
        this.props = props;
        this.cleAbsente = props.apiKey() == null || props.apiKey().isBlank();
        this.applicationId = vide(props.applicationId()) ? null : props.applicationId();
        this.messageId = vide(props.messageId()) ? null : props.messageId();
        this.client = RestClient.builder()
                .baseUrl(props.baseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "App " + props.apiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String envoyerCode(String telephone) {
        verifierCle();
        provisionner();
        try {
            EnvoiPin reponse = client.post()
                    .uri("/2fa/2/pin?ncNeeded=false")
                    .body(new EnvoiPinRequete(applicationId, messageId, props.from(), normaliserMsisdn(telephone)))
                    .retrieve()
                    .body(EnvoiPin.class);
            if (reponse == null || reponse.pinId() == null) {
                throw new ServiceOtpIndisponibleException("Reponse Infobip invalide (pinId absent)");
            }
            log.debug("OTP envoye via Infobip (pinId={}, smsStatus={})", reponse.pinId(), reponse.smsStatus());
            return reponse.pinId();
        } catch (RestClientException e) {
            log.warn("Echec envoi OTP Infobip", e);
            throw new ServiceOtpIndisponibleException("Envoi du code impossible pour le moment", e);
        }
    }

    @Override
    public ResultatVerification verifierCode(String pinId, String code) {
        verifierCle();
        try {
            VerifPin reponse = client.post()
                    .uri("/2fa/2/pin/{pinId}/verify", pinId)
                    .body(Map.of("pin", code))
                    .retrieve()
                    .body(VerifPin.class);
            if (reponse == null) {
                throw new ServiceOtpIndisponibleException("Reponse Infobip invalide (verification)");
            }
            return new ResultatVerification(reponse.verified(), reponse.attemptsRemaining());
        } catch (RestClientException e) {
            log.warn("Echec verification OTP Infobip", e);
            throw new ServiceOtpIndisponibleException("Verification du code impossible pour le moment", e);
        }
    }

    /** Cree application + template si absents (idempotent en memoire). */
    private void provisionner() {
        if (applicationId != null && messageId != null) {
            return;
        }
        synchronized (this) {
            try {
                if (applicationId == null) {
                    CreationApplication app = client.post()
                            .uri("/2fa/2/applications")
                            .body(configurationApplication())
                            .retrieve()
                            .body(CreationApplication.class);
                    applicationId = app != null ? app.applicationId() : null;
                    log.info("Application Infobip 2FA creee, applicationId={} (a fixer dans INFOBIP_2FA_APPLICATION_ID)", applicationId);
                }
                if (messageId == null) {
                    CreationMessage msg = client.post()
                            .uri("/2fa/2/applications/{appId}/messages", applicationId)
                            .body(new MessageRequete("NUMERIC", props.messageText(), props.pinLength(), props.from()))
                            .retrieve()
                            .body(CreationMessage.class);
                    messageId = msg != null ? msg.messageId() : null;
                    log.info("Template Infobip 2FA cree, messageId={} (a fixer dans INFOBIP_2FA_MESSAGE_ID)", messageId);
                }
            } catch (RestClientException e) {
                log.warn("Echec provisionnement application/template Infobip 2FA", e);
                throw new ServiceOtpIndisponibleException("Configuration du service de verification impossible", e);
            }
            if (applicationId == null || messageId == null) {
                throw new ServiceOtpIndisponibleException("Application ou template Infobip 2FA introuvable");
            }
        }
    }

    private Map<String, Object> configurationApplication() {
        return Map.of(
                "name", props.applicationName(),
                "enabled", true,
                "configuration", Map.of(
                        "pinAttempts", 10,
                        "allowMultiplePinVerifications", true,
                        "pinTimeToLive", "15m",
                        "verifyPinLimit", "1/3s",
                        "sendPinPerApplicationLimit", "100/1d",
                        "sendPinPerPhoneNumberLimit", "10/1d"));
    }

    /** Normalise un numero FR vers le format MSISDN attendu par Infobip (33XXXXXXXXX). */
    static String normaliserMsisdn(String telephone) {
        String compact = telephone.replaceAll("[^0-9+]", "");
        if (compact.startsWith("+")) {
            compact = compact.substring(1);
        }
        if (compact.startsWith("0")) {
            compact = "33" + compact.substring(1);
        }
        return compact;
    }

    private void verifierCle() {
        if (cleAbsente) {
            log.warn("INFOBIP_API_KEY absente : verification telephone indisponible");
            throw new ServiceOtpIndisponibleException("Verification du telephone indisponible");
        }
    }

    private static boolean vide(String s) {
        return s == null || s.isBlank();
    }

    private record EnvoiPinRequete(String applicationId, String messageId, String from, String to) {}

    private record EnvoiPin(String pinId, String to, String smsStatus) {}

    private record VerifPin(boolean verified, Integer attemptsRemaining) {}

    private record CreationApplication(String applicationId) {}

    private record MessageRequete(String pinType, String messageText, int pinLength, String senderId) {}

    private record CreationMessage(String messageId) {}
}
