package fr.jegeremacartenavigo.infrastructure.adapter.out.notification;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import fr.jegeremacartenavigo.domain.dossier.port.NotificateurDossier;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Implementation Resend du port {@link NotificateurDossier}.
 *
 * <p>Lit la configuration depuis {@code application.yml} :
 * <ul>
 *   <li>{@code resend.api-key} (env {@code RESEND_API_KEY})</li>
 *   <li>{@code resend.from-email} (env {@code RESEND_FROM_EMAIL})</li>
 *   <li>{@code resend.from-name} (env {@code RESEND_FROM_NAME})</li>
 * </ul>
 *
 * <p>Toutes les notifications partagent le squelette HTML (header bleu Comutitres,
 * card contenu, footer "ne pas repondre"). Chaque methode publique construit
 * son sujet et son corps puis delegue a {@link #envoyer}, qui gere la cle API
 * absente, les exceptions Resend et le logging.
 */
@Component
public class ResendNotificateurDossierAdapter implements NotificateurDossier {

    private static final Logger log = LoggerFactory.getLogger(ResendNotificateurDossierAdapter.class);
    private static final DateTimeFormatter FR_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter FR_DATETIME = DateTimeFormatter.ofPattern("EEEE d MMMM 'à' HH:mm", Locale.FRENCH);
    private static final NumberFormat EUR = NumberFormat.getCurrencyInstance(Locale.FRANCE);

    private final String apiKey;
    private final String fromEmail;
    private final String fromName;

    public ResendNotificateurDossierAdapter(
            @Value("${resend.api-key:}") String apiKey,
            @Value("${resend.from-email:noreply@comutitres.fr}") String fromEmail,
            @Value("${resend.from-name:Comutitres}") String fromName) {
        this.apiKey = apiKey;
        this.fromEmail = fromEmail;
        this.fromName = fromName;
    }

    // ─── Implementations port ─────────────────────────────────────────────

    @Override
    public void notifierChangementStatut(String emailDestinataire, String prenom,
                                          String numero, String libelleAbo,
                                          String libelleAvant, String codeApres,
                                          String libelleApres) {
        Transition t = transition(codeApres);
        String transitionAffichee = (libelleAvant == null || libelleAvant.isBlank())
                ? "<strong>" + esc(libelleApres) + "</strong>"
                : esc(libelleAvant) + " &rarr; <strong>" + esc(libelleApres) + "</strong>";
        String body = """
                <p>%s</p>
                <p>%s</p>
                <p style="margin:0 0 20px 0;padding:24px;background:#fff;border-radius:12px;border-left:5px solid %s;text-align:center;font-size:22px;">
                  %s %s
                </p>
                <p style="margin:0 0 12px 0;">Détails du dossier :</p>
                <ul style="margin:0 0 16px 0;padding:0 0 0 22px;font-size:16px;">
                  <li><strong>Numéro :</strong> %s</li>
                  <li><strong>Abonnement :</strong> %s</li>
                  <li><strong>Changement :</strong> %s</li>
                </ul>
                <p style="margin:0 0 12px 0;">%s</p>
                """.formatted(
                salutation(prenom),
                t.intro,
                t.couleur,
                t.emoji,
                "<strong>" + esc(libelleApres) + "</strong>",
                esc(numero),
                esc(libelleAbo),
                transitionAffichee,
                t.actionRequise
        );
        envoyer(emailDestinataire, t.sujet + " — dossier " + numero,
                t.titreBandeau, body, numero);
    }

    /**
     * Resout les libelles, sujets et messages d'action selon le nouveau statut.
     * Centralise tous les wordings client (l'agent voit le code, le client voit
     * une phrase explicative).
     */
    private record Transition(String sujet, String titreBandeau, String emoji,
                                String couleur, String intro, String actionRequise) {}

    private static Transition transition(String codeApres) {
        if (codeApres == null) codeApres = "";
        return switch (codeApres) {
            case "EN_VERIFICATION" -> new Transition(
                    "Votre dossier est en cours d'examen",
                    "Dossier reçu",
                    "📥",
                    "#1972d2",
                    "Bonne nouvelle ! Votre dossier est désormais entre les mains de nos agents.",
                    "Vous serez notifié par email à la prochaine étape (validation, demande de complément ou refus). Le délai moyen est de 48 à 72 heures ouvrées."
            );
            case "INCOMPLET" -> new Transition(
                    "Action requise sur votre dossier",
                    "Pièces à compléter",
                    "⚠️",
                    "#f39224",
                    "Votre dossier ne peut pas être validé en l'état : il manque des pièces ou certaines ont été refusées.",
                    "Connectez-vous à votre espace Comutitres pour consulter le détail des pièces concernées et déposer les versions corrigées. L'instruction reprendra automatiquement."
            );
            case "VALIDE" -> new Transition(
                    "Vos pièces justificatives sont validées",
                    "Pièces validées",
                    "✅",
                    "#007d44",
                    "Excellente nouvelle ! Toutes les pièces de votre dossier ont été validées par un agent.",
                    "Votre abonnement va prochainement être activé. Vous recevrez un email de confirmation dès que ce sera fait, avec les dates de validité de votre carte Navigo."
            );
            case "REJETE" -> new Transition(
                    "Votre dossier a été refusé",
                    "Dossier refusé",
                    "❌",
                    "#c52625",
                    "Nous sommes au regret de vous informer que votre dossier n'a pas pu être validé.",
                    "Pour comprendre les raisons de cette décision ou contester, contactez notre service client depuis l'espace « Aide et contacts ». Si vous avez payé, le remboursement sera traité automatiquement."
            );
            case "RESILIE" -> new Transition(
                    "Votre abonnement a été résilié",
                    "Abonnement résilié",
                    "🔚",
                    "#53606e",
                    "La résiliation de votre abonnement a bien été enregistrée.",
                    "Votre carte Navigo n'est plus utilisable. Vous pouvez à tout moment souscrire un nouvel abonnement depuis votre espace Comutitres."
            );
            case "EXPIRE" -> new Transition(
                    "Votre abonnement a expiré",
                    "Abonnement expiré",
                    "⏰",
                    "#f39224",
                    "Votre abonnement est arrivé à son terme aujourd'hui.",
                    "Pour continuer à voyager, pensez à renouveler votre abonnement depuis votre espace Comutitres."
            );
            case "EN_ATTENTE_PAIEMENT" -> new Transition(
                    "Votre dossier est en attente de paiement",
                    "Paiement à finaliser",
                    "💳",
                    "#f39224",
                    "Votre dossier a bien été enregistré mais le paiement n'est pas encore finalisé.",
                    "Retournez sur votre espace Comutitres pour finaliser votre paiement. Sans cela, votre dossier ne pourra pas être instruit."
            );
            default -> new Transition(
                    "Mise à jour de votre dossier",
                    "Mise à jour de votre dossier",
                    "ℹ️",
                    "#1972d2",
                    "Le statut de votre dossier vient d'évoluer.",
                    "Consultez votre espace Comutitres pour le détail."
            );
        };
    }

    @Override
    public void notifierBienvenue(String emailDestinataire, String prenom) {
        String body = """
                <p>%s</p>
                <p>Bienvenue chez <strong>Comutitres</strong> ! Votre compte a bien été créé.</p>
                <p>Vous pouvez dès maintenant souscrire à un abonnement Navigo et déposer vos pièces justificatives depuis votre espace personnel.</p>
                """.formatted(salutation(prenom));
        envoyer(emailDestinataire, "Bienvenue chez Comutitres",
                "Votre compte est créé", body, null);
    }

    @Override
    public void notifierSoumissionDossier(String emailDestinataire, String prenom,
                                           String numero, String libelleAbo) {
        String body = """
                <p>%s</p>
                <p>Nous avons bien reçu votre dossier <strong>%s</strong> (%s).</p>
                <p>Un agent va prochainement examiner vos pièces justificatives. Vous serez notifié à chaque étape clé du traitement.</p>
                <p style="margin:0;font-size:15px;color:#53606e;">Le délai moyen d'instruction est de 48 à 72 heures ouvrées.</p>
                """.formatted(salutation(prenom), esc(numero), esc(libelleAbo));
        envoyer(emailDestinataire, "Votre dossier " + numero + " a été reçu",
                "Dossier reçu et en cours d'instruction", body, numero);
    }

    @Override
    public void notifierPieceRejetee(String emailDestinataire, String prenom,
                                      String numero, String libelleTypePiece,
                                      String motifRejet) {
        String body = """
                <p>%s</p>
                <p>Une pièce de votre dossier <strong>%s</strong> n'a pas pu être validée :</p>
                <p style="margin:0 0 16px 0;padding:18px;background:#fff;border-radius:12px;border:1px solid #ffd9d9;">
                  <strong style="color:#c52625;font-size:18px;">%s</strong><br>
                  <span style="font-size:15px;color:#53606e;">Motif : %s</span>
                </p>
                <p>Connectez-vous à votre espace pour déposer une nouvelle pièce et faire repartir l'instruction.</p>
                """.formatted(
                salutation(prenom),
                esc(numero),
                esc(libelleTypePiece),
                (motifRejet == null || motifRejet.isBlank()) ? "non précisé" : esc(motifRejet)
        );
        envoyer(emailDestinataire, "Action requise sur votre dossier " + numero,
                "Une pièce a été rejetée", body, numero);
    }

    @Override
    public void notifierActivation(String emailDestinataire, String prenom,
                                    String numero, String libelleAbo,
                                    LocalDate debut, LocalDate fin, BigDecimal montant) {
        String periode = (debut != null && fin != null)
                ? "Du <strong>" + debut.format(FR_DATE) + "</strong> au <strong>" + fin.format(FR_DATE) + "</strong>"
                : (debut != null
                        ? "À partir du <strong>" + debut.format(FR_DATE) + "</strong>"
                        : "");
        String body = """
                <p>%s</p>
                <p>Votre abonnement <strong>%s</strong> est désormais <span style="color:#007d44;font-weight:600;">actif</span>.</p>
                <table style="width:100%%;border-collapse:collapse;margin:16px 0;font-size:16px;">
                  <tr><td style="padding:14px 18px;background:#fff;border:1px solid #deeeff;border-radius:10px 10px 0 0;font-size:15px;color:#53606e;">Dossier</td><td style="padding:14px 18px;background:#fff;border:1px solid #deeeff;border-left:0;border-radius:0 10px 0 0;"><strong>%s</strong></td></tr>
                  <tr><td style="padding:14px 18px;background:#fff;border:1px solid #deeeff;border-top:0;font-size:15px;color:#53606e;">Période</td><td style="padding:14px 18px;background:#fff;border:1px solid #deeeff;border-left:0;border-top:0;">%s</td></tr>
                  <tr><td style="padding:14px 18px;background:#fff;border:1px solid #deeeff;border-top:0;border-radius:0 0 0 10px;font-size:15px;color:#53606e;">Montant</td><td style="padding:14px 18px;background:#fff;border:1px solid #deeeff;border-left:0;border-top:0;border-radius:0 0 10px 0;"><strong>%s</strong></td></tr>
                </table>
                <p>Bon voyage avec votre abonnement Navigo !</p>
                """.formatted(
                salutation(prenom),
                esc(libelleAbo),
                esc(numero),
                periode,
                montant != null ? esc(EUR.format(montant)) : "—"
        );
        envoyer(emailDestinataire, "Votre abonnement " + libelleAbo + " est actif",
                "Abonnement activé", body, numero);
    }

    @Override
    public void notifierPaiementEnregistre(String emailDestinataire, String prenom,
                                            String numero, String libelleAbo,
                                            BigDecimal montant, String modePaiement) {
        String body = """
                <p>%s</p>
                <p>Votre paiement pour l'abonnement <strong>%s</strong> a bien été enregistré.</p>
                <p style="margin:0 0 16px 0;padding:24px;background:#fff;border-radius:12px;border:1px solid #deeeff;text-align:center;">
                  <span style="font-size:34px;font-weight:700;color:#0050aa;display:block;margin-bottom:6px;">%s</span>
                  <span style="font-size:15px;color:#53606e;">Dossier %s · %s</span>
                </p>
                <p>Conservez cet email comme reçu. Votre abonnement sera activé après validation des pièces justificatives par un agent.</p>
                """.formatted(
                salutation(prenom),
                esc(libelleAbo),
                montant != null ? esc(EUR.format(montant)) : "—",
                esc(numero),
                modePaiementHumain(modePaiement)
        );
        envoyer(emailDestinataire, "Paiement reçu — dossier " + numero,
                "Reçu de paiement", body, numero);
    }

    @Override
    public void notifierConfirmationRdv(String emailDestinataire, String prenom,
                                         String nomPdv, String adressePdv,
                                         LocalDateTime creneau) {
        String dateLisible = creneau != null ? creneau.format(FR_DATETIME) : "(date à confirmer)";
        String body = """
                <p>%s</p>
                <p>Votre rendez-vous en point de vente Navigo est confirmé :</p>
                <p style="margin:0 0 16px 0;padding:20px;background:#fff;border-radius:12px;border:1px solid #deeeff;line-height:1.7;">
                  <strong style="font-size:19px;">%s</strong><br>
                  <span style="color:#0050aa;font-weight:600;font-size:18px;">%s</span><br>
                  <span style="font-size:15px;color:#53606e;">%s</span>
                </p>
                <p style="font-size:15px;color:#53606e;">Pensez à apporter une pièce d'identité et tous les justificatifs nécessaires.</p>
                """.formatted(
                salutation(prenom),
                esc(nomPdv),
                esc(dateLisible),
                esc(adressePdv)
        );
        envoyer(emailDestinataire, "Confirmation de rendez-vous — " + nomPdv,
                "Rendez-vous confirmé", body, null);
    }

    @Override
    public void notifierApprocheFinDroits(String emailDestinataire, String prenom,
                                           String numero, String libelleAbo,
                                           LocalDate fin, int joursRestants) {
        String urgence = joursRestants <= 7
                ? "<span style=\"color:#c52625;font-weight:600;\">dans " + joursRestants + " jour" + (joursRestants > 1 ? "s" : "") + "</span>"
                : "dans <strong>" + joursRestants + " jours</strong>";
        String body = """
                <p>%s</p>
                <p>Votre abonnement <strong>%s</strong> arrive à échéance %s, le <strong>%s</strong>.</p>
                <p>Pensez à le renouveler depuis votre espace personnel pour éviter toute interruption de service.</p>
                <p style="font-size:15px;color:#53606e;">Dossier concerné : <strong>%s</strong></p>
                """.formatted(
                salutation(prenom),
                esc(libelleAbo),
                urgence,
                fin != null ? fin.format(FR_DATE) : "(date inconnue)",
                esc(numero)
        );
        envoyer(emailDestinataire,
                joursRestants <= 7
                        ? "Votre abonnement expire bientôt"
                        : "Pensez à renouveler votre abonnement",
                "Renouvellement à prévoir", body, numero);
    }

    // ─── Helpers ────────────────────────────────────────────────────────

    private void envoyer(String emailDestinataire, String subject, String titre,
                          String corpsHtml, String referenceLog) {
        if (emailDestinataire == null || emailDestinataire.isBlank()) {
            log.debug("Notification ignoree : email vide (ref={})", referenceLog);
            return;
        }
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("RESEND_API_KEY non configuree : email vers {} non envoye (ref={}).",
                    emailDestinataire, referenceLog);
            return;
        }

        String html = squelette(titre, corpsHtml);
        try {
            Resend resend = new Resend(apiKey);
            CreateEmailOptions params = CreateEmailOptions.builder()
                    .from(fromName + " <" + fromEmail + ">")
                    .to(emailDestinataire)
                    .subject(subject)
                    .html(html)
                    .build();
            CreateEmailResponse response = resend.emails().send(params);
            log.info("Resend OK : ref={}, destinataire={}, id={}",
                    referenceLog, emailDestinataire, response.getId());
        } catch (ResendException e) {
            log.error("Echec envoi Resend (ref={}) : {}", referenceLog, e.getMessage());
        } catch (Exception e) {
            log.error("Erreur inattendue Resend (ref={}) : {}", referenceLog, e.getMessage(), e);
        }
    }

    private String squelette(String titre, String corps) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"></head>
                <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;color:#25303b;line-height:1.65;font-size:17px;max-width:680px;margin:0 auto;padding:32px 24px;">
                  <div style="background:#1972d2;color:#fff;padding:28px 32px;border-radius:18px 18px 0 0;">
                    <h1 style="margin:0;font-size:26px;font-weight:700;line-height:1.3;">%s</h1>
                  </div>
                  <div style="background:#f5f9ff;padding:32px;border-radius:0 0 18px 18px;border:1px solid #deeeff;border-top:none;font-size:17px;">
                    %s
                    <p style="margin:24px 0 0 0;font-size:15px;color:#53606e;">
                      Retrouvez tous vos dossiers depuis votre espace Comutitres.
                    </p>
                  </div>
                  <p style="margin:20px 0 0 0;font-size:13px;color:#9aa3ad;text-align:center;">
                    Cet email est envoyé automatiquement, merci de ne pas y répondre.
                  </p>
                </body>
                </html>
                """.formatted(esc(titre), corps);
    }

    private static String salutation(String prenom) {
        return (prenom == null || prenom.isBlank())
                ? "Bonjour,"
                : "Bonjour " + esc(prenom) + ",";
    }

    private static String modePaiementHumain(String code) {
        if (code == null) return "";
        return switch (code.toUpperCase()) {
            case "CB" -> "Carte bancaire";
            case "SEPA" -> "Prélèvement SEPA";
            default -> esc(code);
        };
    }

    private static String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&#39;");
    }
}
