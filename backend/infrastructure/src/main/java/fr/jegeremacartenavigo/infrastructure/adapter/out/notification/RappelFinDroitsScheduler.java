package fr.jegeremacartenavigo.infrastructure.adapter.out.notification;

import fr.jegeremacartenavigo.domain.dossier.port.NotificateurDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.Dossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier.DossierJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Envoie des rappels de renouvellement aux porteurs d'abonnements ACTIFS
 * dont la date de fin approche. Tourne tous les jours a 9h00 (heure locale).
 *
 * <p>Deux seuils : T-30j (alerte douce) et T-7j (urgence). Le template de
 * {@link NotificateurDossier#notifierApprocheFinDroits} adapte le wording
 * selon {@code joursRestants}.
 *
 * <p>Pas d'etat de "deja envoye" : l'envoi est conditionne par une egalite
 * stricte sur la date de fin de droits, donc un dossier ne sera notifie
 * qu'une seule fois par seuil (le scheduler ne tourne qu'une fois par jour).
 */
@Component
public class RappelFinDroitsScheduler {

    private static final Logger log = LoggerFactory.getLogger(RappelFinDroitsScheduler.class);
    private static final int[] SEUILS_JOURS = { 30, 7 };

    private final DossierJpaRepository dossierJpa;
    private final NotificateurDossier notificateur;

    public RappelFinDroitsScheduler(DossierJpaRepository dossierJpa,
                                     NotificateurDossier notificateur) {
        this.dossierJpa = dossierJpa;
        this.notificateur = notificateur;
    }

    /**
     * Cron quotidien : tous les jours a 09:00 heure locale du serveur.
     * Format Spring : seconde minute heure jour-du-mois mois jour-de-semaine.
     */
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional(readOnly = true)
    public void envoyerRappelsQuotidiens() {
        LocalDate aujourdhui = LocalDate.now();
        int envoyes = 0;
        for (int joursRestants : SEUILS_JOURS) {
            LocalDate dateCible = aujourdhui.plusDays(joursRestants);
            List<Dossier> dossiers = dossierJpa.findActifsAvecFinDroitsLe(dateCible);
            for (Dossier d : dossiers) {
                Utilisateur porteur = d.getUtilisateurPorteur();
                if (porteur == null || porteur.getEmail() == null) continue;
                notificateur.notifierApprocheFinDroits(
                        porteur.getEmail(),
                        porteur.getPrenom(),
                        d.getNumeroDossier(),
                        d.getTypeAbonnement().getLibelle(),
                        d.getDateFinDroits(),
                        joursRestants
                );
                envoyes++;
            }
        }
        if (envoyes > 0) {
            log.info("Rappels fin de droits : {} email(s) envoye(s) le {}", envoyes, aujourdhui);
        }
    }
}
