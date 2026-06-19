package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.CategorieStatutDossier;
import fr.jegeremacartenavigo.domain.dossier.model.CodeStatutDossier;
import fr.jegeremacartenavigo.domain.dossier.model.DossierDashboard;
import fr.jegeremacartenavigo.domain.dossier.model.FiltreDossiers;
import fr.jegeremacartenavigo.domain.dossier.model.RoleDossier;
import fr.jegeremacartenavigo.domain.dossier.model.StatutDossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.TransportMode;
import fr.jegeremacartenavigo.domain.dossier.model.UtilisateurIdentite;
import fr.jegeremacartenavigo.domain.dossier.model.ZoneNavigo;
import fr.jegeremacartenavigo.domain.dossier.port.DossierDashboardRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.TypeAbonnement;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * Adapter JPA implementant le port domaine {@link DossierDashboardRepository}.
 */
@Component
public class DossierDashboardRepositoryAdapter implements DossierDashboardRepository {

    private static final Set<CodeStatutDossier> STATUTS_ACTIVE = Set.of(
            CodeStatutDossier.VALIDE, CodeStatutDossier.ACTIF);

    private static final Set<CodeStatutDossier> STATUTS_EN_COURS = Set.of(
            CodeStatutDossier.BROUILLON, CodeStatutDossier.EN_VERIFICATION,
            CodeStatutDossier.INCOMPLET, CodeStatutDossier.EN_ATTENTE_PAIEMENT);

    private static final Set<CodeStatutDossier> STATUTS_FERME = Set.of(
            CodeStatutDossier.RESILIE, CodeStatutDossier.EXPIRE, CodeStatutDossier.REJETE);

    private final DossierJpaRepository jpa;

    public DossierDashboardRepositoryAdapter(DossierJpaRepository jpa) {
        this.jpa = jpa;
    }

    @Override
    public List<DossierDashboard> findForUser(Integer idUtilisateur, FiltreDossiers filtre) {
        return jpa.findAllPourUtilisateur(idUtilisateur).stream()
                .map(d -> toDomain(d, idUtilisateur))
                .filter(d -> matches(d.statut().code(), filtre))
                .toList();
    }

    private static DossierDashboard toDomain(Dossier d, Integer idUtilisateur) {
        Utilisateur porteur = d.getUtilisateurPorteur();
        Utilisateur payeur = d.getUtilisateurPayeur();
        boolean estPorteur = porteur.getIdUtilisateur().equals(idUtilisateur);
        boolean estPayeur = payeur.getIdUtilisateur().equals(idUtilisateur);

        RoleDossier role;
        if (estPorteur && estPayeur) {
            role = RoleDossier.PORTEUR_ET_PAYEUR;
        } else if (estPorteur) {
            role = RoleDossier.PORTEUR;
        } else {
            role = RoleDossier.PAYEUR;
        }

        StatutDossier statut = d.getStatutActuel();
        CodeStatutDossier codeStatut = CodeStatutDossier.valueOf(statut.getCode());
        StatutDossierResume statutResume = new StatutDossierResume(
                statut.getCode(),
                statut.getLibelle(),
                statut.getOrdre(),
                CategorieStatutDossier.valueOf(statut.getCategorie().name())
        );

        TypeAbonnement type = d.getTypeAbonnement();
        List<TransportMode> transports = toTransports(type.getTransports());
        List<ZoneNavigo> zones = toZones(type.getZones());

        LocalDate dateFinDroits = d.getDateFinDroits();
        LocalDate dateRenouvellement = dateFinDroits != null ? dateFinDroits.minusDays(30) : null;

        return new DossierDashboard(
                d.getIdDossier(),
                d.getNumeroDossier(),
                role,
                toIdentite(porteur),
                toIdentite(payeur),
                type.getLibelle(),
                transports,
                zones,
                statutResume,
                d.getDateCreation(),
                d.getDateDebutDroits(),
                dateFinDroits,
                dateRenouvellement,
                d.getMontantTotal(),
                codeStatut == CodeStatutDossier.INCOMPLET,
                d.getBeneficiaireNomComplet()
        );
    }

    private static boolean matches(String codeStr, FiltreDossiers filtre) {
        try {
            CodeStatutDossier code = CodeStatutDossier.valueOf(codeStr);
            return switch (filtre) {
                case ACTIVE   -> STATUTS_ACTIVE.contains(code);
                case EN_COURS -> STATUTS_EN_COURS.contains(code);
                case FERME    -> STATUTS_FERME.contains(code);
                case ALL      -> true;
            };
        } catch (IllegalArgumentException e) {
            return filtre == FiltreDossiers.ALL;
        }
    }

    private static UtilisateurIdentite toIdentite(Utilisateur u) {
        return new UtilisateurIdentite(u.getIdUtilisateur(), u.getNom(), u.getPrenom());
    }

    private static List<TransportMode> toTransports(String[] arr) {
        if (arr == null) return List.of();
        return Arrays.stream(arr)
                .map(s -> {
                    try { return TransportMode.valueOf(s); }
                    catch (IllegalArgumentException e) { return null; }
                })
                .filter(t -> t != null)
                .toList();
    }

    private static List<ZoneNavigo> toZones(String[] arr) {
        if (arr == null) return List.of();
        return Arrays.stream(arr)
                .map(s -> {
                    try { return ZoneNavigo.valueOf(s); }
                    catch (IllegalArgumentException e) { return null; }
                })
                .filter(z -> z != null)
                .toList();
    }
}
