package fr.jegeremacartenavigo.domain.dossier.port;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Port secondaire : envoi de notifications transactionnelles par email.
 * Adapter par defaut : Resend (cf. infrastructure).
 *
 * <p>Toutes les methodes sont best-effort : si l'API est indisponible, la cle
 * absente ou l'email destinataire vide, l'implementation logge et retourne
 * silencieusement, sans propager d'exception qui interromprait l'operation
 * metier deja persistee.
 */
public interface NotificateurDossier {

    /**
     * Notifie le porteur d'un changement de statut generique. Utilise quand
     * aucune notif specialisee ne s'applique (ex: REJETE manuel, EXPIRE,
     * auto-VALIDE etc.). Skip recommande pour ACTIF (cf.
     * {@link #notifierActivation}) et pour les auto-INCOMPLET qui suivent un
     * rejet de piece (cf. {@link #notifierPieceRejetee}).
     */
    void notifierChangementStatut(String emailDestinataire,
                                   String prenomDestinataire,
                                   String numeroDossier,
                                   String libelleAbonnement,
                                   String codeStatutAvant,
                                   String codeStatutApres,
                                   String libelleStatutApres);

    /** Confirmation de creation de compte. */
    void notifierBienvenue(String emailDestinataire, String prenomDestinataire);

    /** Accuse de reception apres soumission du dossier pour verification. */
    void notifierSoumissionDossier(String emailDestinataire,
                                    String prenomDestinataire,
                                    String numeroDossier,
                                    String libelleAbonnement);

    /**
     * Notif precise quand un agent rejette une piece. Inclut le motif pour
     * que le client sache quoi corriger.
     */
    void notifierPieceRejetee(String emailDestinataire,
                               String prenomDestinataire,
                               String numeroDossier,
                               String libelleTypePiece,
                               String motifRejet);

    /**
     * Activation effective de l'abonnement (statut ACTIF). Email enrichi avec
     * dates de droits et montant.
     */
    void notifierActivation(String emailDestinataire,
                             String prenomDestinataire,
                             String numeroDossier,
                             String libelleAbonnement,
                             LocalDate dateDebutDroits,
                             LocalDate dateFinDroits,
                             BigDecimal montantTotal);

    /** Recu de paiement enregistre. */
    void notifierPaiementEnregistre(String emailDestinataire,
                                     String prenomDestinataire,
                                     String numeroDossier,
                                     String libelleAbonnement,
                                     BigDecimal montantTotal,
                                     String modePaiement);

    /** Confirmation de prise de RDV en point de vente. */
    void notifierConfirmationRdv(String emailDestinataire,
                                  String prenomDestinataire,
                                  String nomPointDeVente,
                                  String adressePointDeVente,
                                  LocalDateTime creneau);

    /**
     * Rappel d'approche de fin de droits (T-30j / T-7j). {@code joursRestants}
     * sert au template pour adapter le message d'urgence.
     */
    void notifierApprocheFinDroits(String emailDestinataire,
                                    String prenomDestinataire,
                                    String numeroDossier,
                                    String libelleAbonnement,
                                    LocalDate dateFinDroits,
                                    int joursRestants);
}
