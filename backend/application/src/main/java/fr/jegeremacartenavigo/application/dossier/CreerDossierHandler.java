package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.CommandHandler;
import fr.jegeremacartenavigo.domain.dossier.exception.BeneficiaireManquantException;
import fr.jegeremacartenavigo.domain.dossier.exception.PieceObligatoireManquanteException;
import fr.jegeremacartenavigo.domain.dossier.model.DemandePour;
import fr.jegeremacartenavigo.domain.dossier.model.DossierCree;
import fr.jegeremacartenavigo.domain.dossier.model.NouveauDossier;
import fr.jegeremacartenavigo.domain.dossier.model.SituationDemande;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;

public class CreerDossierHandler implements CommandHandler<CreerDossierCommand, DossierResponse> {

    private final DossierRepository repository;

    public CreerDossierHandler(DossierRepository repository) {
        this.repository = repository;
    }

    @Override
    public DossierResponse handle(CreerDossierCommand command) {
        validerPiecesObligatoires(command);

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
}
