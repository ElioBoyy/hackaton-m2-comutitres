package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.CategorieStatutDossier;
import fr.jegeremacartenavigo.domain.dossier.model.DossierDashboard;
import fr.jegeremacartenavigo.domain.dossier.model.FiltreDossiers;
import fr.jegeremacartenavigo.domain.dossier.model.RoleDossier;
import fr.jegeremacartenavigo.domain.dossier.model.StatutDossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.UtilisateurIdentite;
import fr.jegeremacartenavigo.domain.dossier.port.DossierDashboardRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Adapter JPA implementant le port domaine {@link DossierDashboardRepository}.
 * Determine le role (porteur/payeur/les deux) de l'utilisateur sur chaque
 * dossier et, le cas echeant, l'identite de l'autre partie.
 */
@Component
public class DossierDashboardRepositoryAdapter implements DossierDashboardRepository {

    private static final String CODE_STATUT_PIECES_MANQUANTES = "PIECES_MANQUANTES";

    private final DossierJpaRepository jpa;

    public DossierDashboardRepositoryAdapter(DossierJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<DossierDashboard> findForUser(Integer idUtilisateur, FiltreDossiers filtre) {
        return jpa.findAllPourUtilisateur(idUtilisateur).stream()
                .map(d -> toDomain(d, idUtilisateur))
                .filter(d -> filtre == FiltreDossiers.ALL || d.statut().categorie().estActif())
                .toList();
    }

    private static DossierDashboard toDomain(Dossier d, Integer idUtilisateur) {
        Utilisateur porteur = d.getUtilisateurPorteur();
        Utilisateur payeur = d.getUtilisateurPayeur();
        boolean estPorteur = porteur.getIdUtilisateur().equals(idUtilisateur);
        boolean estPayeur = payeur.getIdUtilisateur().equals(idUtilisateur);

        RoleDossier role;
        UtilisateurIdentite autrePersonne;
        if (estPorteur && estPayeur) {
            role = RoleDossier.PORTEUR_ET_PAYEUR;
            autrePersonne = null;
        } else if (estPorteur) {
            role = RoleDossier.PORTEUR;
            autrePersonne = toIdentite(payeur);
        } else {
            role = RoleDossier.PAYEUR;
            autrePersonne = toIdentite(porteur);
        }

        StatutDossier statut = d.getStatutActuel();
        StatutDossierResume statutResume = new StatutDossierResume(
                statut.getCode(),
                statut.getLibelle(),
                statut.getOrdre(),
                CategorieStatutDossier.valueOf(statut.getCategorie().name())
        );

        return new DossierDashboard(
                d.getIdDossier(),
                role,
                autrePersonne,
                d.getTypeAbonnement().getLibelle(),
                statutResume,
                d.getDateCreation(),
                d.getDateDebutDroits(),
                d.getDateFinDroits(),
                d.getMontantTotal(),
                CODE_STATUT_PIECES_MANQUANTES.equals(statut.getCode())
        );
    }

    private static UtilisateurIdentite toIdentite(Utilisateur u) {
        return new UtilisateurIdentite(u.getIdUtilisateur(), u.getNom(), u.getPrenom());
    }
}
