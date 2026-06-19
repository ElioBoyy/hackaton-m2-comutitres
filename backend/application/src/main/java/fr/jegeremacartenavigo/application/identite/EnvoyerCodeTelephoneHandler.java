package fr.jegeremacartenavigo.application.identite;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.identite.exception.TelephoneAbsentException;
import fr.jegeremacartenavigo.domain.identite.model.EtatVerificationTelephone;
import fr.jegeremacartenavigo.domain.identite.port.ServiceOtp;
import fr.jegeremacartenavigo.domain.identite.port.VerificationTelephoneRepository;

/**
 * Envoie un code OTP par SMS. Si le telephone est deja verifie, n'envoie rien
 * (idempotent). Memorise le pinId retourne pour la verification ulterieure.
 */
public class EnvoyerCodeTelephoneHandler
        implements CommandHandler<EnvoyerCodeTelephoneCommand, EnvoiCodeResponse> {

    private final VerificationTelephoneRepository repository;
    private final ServiceOtp serviceOtp;

    public EnvoyerCodeTelephoneHandler(VerificationTelephoneRepository repository,
                                       ServiceOtp serviceOtp) {
        this.repository = repository;
        this.serviceOtp = serviceOtp;
    }

    @Override
    public EnvoiCodeResponse handle(EnvoyerCodeTelephoneCommand command) {
        EtatVerificationTelephone etat = repository.charger(command.utilisateurId())
                .orElseThrow(UtilisateurIntrouvableException::new);

        if (etat.telephone() == null || etat.telephone().isBlank()) {
            throw new TelephoneAbsentException();
        }
        if (etat.verifie()) {
            return new EnvoiCodeResponse(masquer(etat.telephone()), true);
        }

        String pinId = serviceOtp.envoyerCode(etat.telephone());
        repository.enregistrerPinId(command.utilisateurId(), pinId);
        return new EnvoiCodeResponse(masquer(etat.telephone()), false);
    }

    /** Garde les deux derniers chiffres visibles : "•••••• 78". */
    private static String masquer(String telephone) {
        String compact = telephone.replaceAll("\\s", "");
        String fin = compact.length() >= 2 ? compact.substring(compact.length() - 2) : compact;
        return "•••••• " + fin;
    }
}
