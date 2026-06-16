package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import fr.jegeremacartenavigo.application.cqrs.QueryBus;
import fr.jegeremacartenavigo.application.dossier.DashboardUtilisateurResponse;
import fr.jegeremacartenavigo.application.dossier.ObtenirDashboardUtilisateurQuery;
import fr.jegeremacartenavigo.domain.dossier.model.FiltreDossiers;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Tableau de bord de l'utilisateur connecte (NAV-013). L'identite vient du
 * JWT ({@code sub} = id utilisateur), impossible de consulter le dashboard de quelqu'un d'autre.
 */
@RestController
@Tag(name = "Dashboard", description = "Tableau de bord de l'utilisateur connecte (NAV-013)")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final QueryBus queryBus;

    public DashboardController(QueryBus queryBus) {
        this.queryBus = queryBus;
    }

    @GetMapping("/api/dashboard")
    @Operation(
            summary = "Get the connected user's dashboard",
            description = "Returns the user's identity, unread reduction/refund alerts and the list of "
                    + "folders (cases) where they are holder and/or payer (no duplicate when both).",
            responses = @ApiResponse(
                    responseCode = "200",
                    content = @Content(examples = @ExampleObject(value = """
                            {
                              "utilisateur": { "idUtilisateur": 1, "nom": "Martin", "prenom": "Lea" },
                              "alertes": [
                                {
                                  "idNotification": 2,
                                  "type": "REMBOURSEMENT_DISPONIBLE",
                                  "titre": "Remboursement disponible",
                                  "contenu": "Un remboursement partiel est disponible sur votre dossier.",
                                  "dateCreation": "2026-06-15T18:24:08.240634"
                                }
                              ],
                              "dossiers": [
                                {
                                  "idDossier": 1,
                                  "role": "PORTEUR_ET_PAYEUR",
                                  "autrePersonne": null,
                                  "typeAbonnementLibelle": "Imagine R Etudiant",
                                  "statut": { "code": "ACTIF", "libelle": "Actif", "ordre": 8, "categorie": "abouti" },
                                  "dateCreation": "2026-04-16T18:24:08.237053",
                                  "dateDebutDroits": "2026-04-16",
                                  "dateFinDroits": "2027-04-16",
                                  "montantTotal": 394.00,
                                  "piecesADeposer": false
                                }
                              ]
                            }
                            """))
            )
    )
    public DashboardUtilisateurResponse dashboard(
            @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "Restrict the folder list to active ones, or lift the filter")
            @RequestParam(defaultValue = "ACTIVE") FiltreDossiers folderFilter) {
        Integer idUtilisateur = Integer.valueOf(jwt.getSubject());
        return queryBus.ask(new ObtenirDashboardUtilisateurQuery(idUtilisateur, folderFilter));
    }
}
