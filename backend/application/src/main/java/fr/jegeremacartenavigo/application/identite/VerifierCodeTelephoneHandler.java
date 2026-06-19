package fr.jegeremacartenavigo.application.identite;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.identite.exception.CodeNonEnvoyeException;
import fr.jegeremacartenavigo.domain.identite.model.EtatVerificationTelephone;
import fr.jegeremacartenavigo.domain.identite.model.ResultatVerification;
import fr.jegeremacartenavigo.domain.identite.port.ServiceOtp;
import fr.jegeremacartenavigo.domain.identite.port.VerificationTelephoneRepository;

/**
 * Verifie le code OTP. Un code faux n'est pas une erreur serveur : on renvoie
 * {@code verifie=false} (200) avec le nombre d'essais restants. Seuls l'absence
 * de PIN envoye ou d'utilisateur levent une exception.
 */
public class VerifierCodeTelephoneHandler
        implements CommandHandler<VerifierCodeTelephoneCommand, VerificationResponse> {

    private final VerificationTelephoneRepository repository;
    private final ServiceOtp serviceOtp;

    public VerifierCodeTelephoneHandler(VerificationTelephoneRepository repository,
                                        ServiceOtp serviceOtp) {
        this.repository = repository;
        this.serviceOtp = serviceOtp;
    }

    @Override
    public VerificationResponse handle(VerifierCodeTelephoneCommand command) {
        EtatVerificationTelephone etat = repository.charger(command.utilisateurId())
                .orElseThrow(UtilisateurIntrouvableException::new);

        if (etat.verifie()) {
            return new VerificationResponse(true, null);
        }
        if (etat.pinId() == null || etat.pinId().isBlank()) {
            throw new CodeNonEnvoyeException();
        }

        ResultatVerification resultat = serviceOtp.verifierCode(etat.pinId(), command.code());
        if (resultat.verifie()) {
            repository.marquerVerifie(command.utilisateurId());
        }
        return new VerificationResponse(resultat.verifie(), resultat.tentativesRestantes());
    }
}
