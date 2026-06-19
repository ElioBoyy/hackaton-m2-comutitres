package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.AbonnementActifExistantException;
import fr.jegeremacartenavigo.domain.dossier.exception.BeneficiaireManquantException;
import fr.jegeremacartenavigo.domain.dossier.exception.PieceObligatoireManquanteException;
import fr.jegeremacartenavigo.domain.dossier.model.DemandePour;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;
import fr.jegeremacartenavigo.domain.dossier.model.SituationDemande;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

import java.time.LocalDate;

public class CreerDossierHandler implements CommandHandler<CreerDossierCommand, DossierResponse> {

    private final DossierRepository repository;

    public CreerDossierHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public DossierResponse handle(CreerDossierCommand command) {
        validerPiecesObligatoires(command);
        validerPasDeDoublon(command);

        NouveauDossier nouveauDossier = new NouveauDossier(
                command.idUtilisateurConnecte(),
                command.idDossierExistant(),
                command.demandePour(),
                command.beneficiaireNomComplet(),
                command.situation(),
                command.situationPrecision(),
                command.boursier(),
                command.codeTypeAbonnement(),
                command.cheminPieceIdentite(),
                command.cheminCertificatScolarite(),
                command.cheminNotificationBourse(),
                command.modePaiement(),
                command.enAttentePaiement()
        );

        DossierCree cree = repository.enregistrer(nouveauDossier);
        return DossierResponse.from(cree);
    }

    // Miroir cote serveur de piecesSontCompletes (front, cf. CONTEXT.md) :
    // CNI toujours requise, certificat de scolarite requis si etudiant. La
    // notification de bourse reste facultative meme si boursier = true.
    //
    // Ces pieces ne sont exigees que si on paie reellement (modePaiement
    // present) ET qu'on cree un nouveau dossier. Pour un dossier existant
    // (idDossierExistant != null), les pieces ont ete deposees independamment
    // via /dossier/{id} (upload UI) ; on delegue la validation au repository
    // qui peut lire les pieces existantes en base.
    private void validerPiecesObligatoires(CreerDossierCommand command) {
        if (command.demandePour() == DemandePour.TIERS
                && (command.beneficiaireNomComplet() == null || command.beneficiaireNomComplet().isBlank())) {
            throw new BeneficiaireManquantException();
        }
        if (command.modePaiement() == null) {
            return;
        }
        // Dossier existant : les pieces sont sur le dossier en base, pas dans
        // le payload (le frontend ne renvoie pas les chemins quand on paie un
        // brouillon existant). Le repository verifie en base.
        if (command.idDossierExistant() != null) {
            return;
        }
        if (command.cheminPieceIdentite() == null || command.cheminPieceIdentite().isBlank()) {
            throw new PieceObligatoireManquanteException("La piece d'identite est requise pour payer.");
        }
        if (command.situation() == SituationDemande.ETUDIANT
                && (command.cheminCertificatScolarite() == null || command.cheminCertificatScolarite().isBlank())) {
            throw new PieceObligatoireManquanteException(
                    "Le certificat de scolarite est requis pour une situation Etudiant.");
        }
    }

    /**
     * Bloque la creation d'un dossier qui ferait doublon avec un abonnement
     * deja actif chez ce porteur (lui-meme si MOI, ou la meme personne nommee
     * si TIERS). Saute le check quand on continue un brouillon existant
     * ({@code idDossierExistant} non nul) : le dossier vise n'est par
     * definition pas encore actif.
     */
    private void validerPasDeDoublon(CreerDossierCommand command) {
        if (command.idDossierExistant() != null) {
            return;
        }
        String beneficiaire = command.demandePour() == DemandePour.TIERS
                ? command.beneficiaireNomComplet()
                : null;
        if (repository.existeAbonnementActifPour(command.idUtilisateurConnecte(), beneficiaire, LocalDate.now())) {
            throw new AbonnementActifExistantException(beneficiaire);
        }
    }
}
