package fr.jegeremacartenavigo.domain.dossier.port;

import fr.jegeremacartenavigo.domain.dossier.model.DossierDashboard;
import fr.jegeremacartenavigo.domain.dossier.model.FiltreDossiers;

import java.util.List;

/**
 * Port secondaire : dossiers d'un utilisateur (porteur et/ou payeur, sans
 * doublon) pour le tableau de bord. Implementation JPA dans la couche
 * infrastructure.
 */
public interface DossierDashboardRepository {

    /**
     * Dossiers ou l'utilisateur est porteur et/ou payeur, tries par date de
     * creation decroissante. {@code filtre} restreint aux dossiers actifs
     * (en_cours/abouti) ou leve le filtre (tous statuts).
     */
    List<DossierDashboard> findForUser(Integer idUtilisateur, FiltreDossiers filtre);
}
