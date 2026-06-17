package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.DossierDetail;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.dossier.model.Personne;
import fr.jegeremacartenavigo.domain.dossier.model.PieceJustificativeResume;
import fr.jegeremacartenavigo.domain.dossier.port.DossierRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.referentiel.StatutDossier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Adapter JPA implementant le port domaine {@link DossierRepository}.
 * Mapping entre les entites JPA (Dossier, PieceJustificative...) et les
 * records domaine (DossierResume, DossierDetail).
 */
@Component
public class DossierRepositoryAdapter implements DossierRepository {

    private final DossierJpaRepository dossierJpa;
    private final PieceJustificativeJpaRepository pieceJpa;

    public DossierRepositoryAdapter(DossierJpaRepository dossierJpa,
                                     PieceJustificativeJpaRepository pieceJpa) {
        this.dossierJpa = dossierJpa;
        this.pieceJpa = pieceJpa;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<DossierResume> findPage(String categorieStatut, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("dateCreation").descending());

        Page<Dossier> resultat = categorieStatut == null
                ? dossierJpa.findAll(pageRequest)
                : dossierJpa.findByStatutActuel_Categorie(
                        StatutDossier.Categorie.valueOf(categorieStatut), pageRequest);

        List<Integer> idsDossier = resultat.getContent().stream().map(Dossier::getIdDossier).toList();
        Map<Integer, Long> nbPiecesEnAttenteParDossier = idsDossier.isEmpty()
                ? Map.of()
                : pieceJpa.countByStatutGroupByDossier(PieceJustificative.StatutValidation.en_attente, idsDossier)
                    .stream()
                    .collect(Collectors.toMap(
                            PieceJustificativeJpaRepository.NbPiecesEnAttenteParDossier::getIdDossier,
                            PieceJustificativeJpaRepository.NbPiecesEnAttenteParDossier::getTotal));

        List<DossierResume> dossiers = resultat.getContent().stream()
                .map(d -> toResume(d, nbPiecesEnAttenteParDossier.getOrDefault(d.getIdDossier(), 0L)))
                .toList();

        return new PageResult<>(dossiers, page, pageSize, resultat.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<DossierDetail> findDetailById(Integer id) {
        return dossierJpa.findById(id).map(this::toDetail);
    }

    private static DossierResume toResume(Dossier d, long nbPiecesEnAttente) {
        return new DossierResume(
                d.getIdDossier(),
                nomComplet(d.getUtilisateurPorteur()),
                d.getTypeAbonnement().getCode(),
                d.getTypeAbonnement().getLibelle(),
                d.getStatutActuel().getCode(),
                d.getStatutActuel().getLibelle(),
                d.getStatutActuel().getCategorie().name(),
                nbPiecesEnAttente,
                d.getDateCreation()
        );
    }

    private DossierDetail toDetail(Dossier d) {
        List<PieceJustificativeResume> pieces = pieceJpa
                .findByDossier_IdDossierOrderByDateDepotDesc(d.getIdDossier())
                .stream()
                .map(DossierRepositoryAdapter::toPieceResume)
                .toList();

        return new DossierDetail(
                d.getIdDossier(),
                toPersonne(d.getUtilisateurPorteur()),
                toPersonne(d.getUtilisateurPayeur()),
                d.getTypeAbonnement().getCode(),
                d.getTypeAbonnement().getLibelle(),
                d.getStatutActuel().getCode(),
                d.getStatutActuel().getLibelle(),
                d.getStatutActuel().getCategorie().name(),
                d.getDateCreation(),
                d.getDateDebutDroits(),
                d.getDateFinDroits(),
                d.getMontantTotal(),
                pieces
        );
    }

    private static PieceJustificativeResume toPieceResume(PieceJustificative p) {
        return new PieceJustificativeResume(
                p.getIdPiece(),
                p.getTypePiece().getLibelle(),
                p.getStatutValidation().name(),
                p.getDateDepot(),
                p.getMotifRejet()
        );
    }

    private static Personne toPersonne(Utilisateur u) {
        return new Personne(u.getIdUtilisateur(), u.getNom(), u.getPrenom(), u.getEmail());
    }

    private static String nomComplet(Utilisateur u) {
        return u.getPrenom() + " " + u.getNom();
    }
}
