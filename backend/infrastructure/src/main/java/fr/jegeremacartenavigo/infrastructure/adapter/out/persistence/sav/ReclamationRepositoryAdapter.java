package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import fr.jegeremacartenavigo.domain.auth.exception.AgentIntrouvableException;
import fr.jegeremacartenavigo.domain.auth.exception.UtilisateurIntrouvableException;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.sav.exception.CategorieReclamationIntrouvableException;
import fr.jegeremacartenavigo.domain.sav.exception.ReclamationIntrouvableException;
import fr.jegeremacartenavigo.domain.sav.model.AuteurMessage;
import fr.jegeremacartenavigo.domain.sav.model.GroupeStatutReclamation;
import fr.jegeremacartenavigo.domain.sav.model.MessageReclamation;
import fr.jegeremacartenavigo.domain.sav.model.NouvelleReclamation;
import fr.jegeremacartenavigo.domain.sav.model.Reclamation;
import fr.jegeremacartenavigo.domain.sav.model.ReclamationResume;
import fr.jegeremacartenavigo.domain.sav.model.StatutReclamation;
import fr.jegeremacartenavigo.domain.sav.port.ReclamationRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.Agent;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.backoffice.AgentJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.Utilisateur;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.identite.UtilisateurJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Adapter JPA du port {@link ReclamationRepository}, au-dessus de
 * {@code ticket_sav} + {@code historique_ticket}. Le fil de messages d'une
 * reclamation est reconstitue depuis la description initiale (premier message
 * client) puis les entrees d'historique {@code message_utilisateur} /
 * {@code message_agent}.
 */
@Component
public class ReclamationRepositoryAdapter implements ReclamationRepository {

    private static final Set<HistoriqueTicket.TypeAction> TYPES_MESSAGE =
            Set.of(HistoriqueTicket.TypeAction.message_utilisateur, HistoriqueTicket.TypeAction.message_agent);

    private final TicketSavJpaRepository tickets;
    private final HistoriqueTicketJpaRepository historiques;
    private final CategorieSavJpaRepository categories;
    private final UtilisateurJpaRepository utilisateurs;
    private final AgentJpaRepository agents;

    public ReclamationRepositoryAdapter(TicketSavJpaRepository tickets,
                                        HistoriqueTicketJpaRepository historiques,
                                        CategorieSavJpaRepository categories,
                                        UtilisateurJpaRepository utilisateurs,
                                        AgentJpaRepository agents) {
        this.tickets = tickets;
        this.historiques = historiques;
        this.categories = categories;
        this.utilisateurs = utilisateurs;
        this.agents = agents;
    }

    @Override
    @Transactional
    public Reclamation creer(NouvelleReclamation nouvelle) {
        CategorieSav categorie = categories.findByCode(nouvelle.codeCategorie())
                .orElseThrow(() -> new CategorieReclamationIntrouvableException(nouvelle.codeCategorie()));
        Utilisateur utilisateur = utilisateurs.findById(nouvelle.idUtilisateur())
                .orElseThrow(UtilisateurIntrouvableException::new);

        LocalDateTime maintenant = LocalDateTime.now();
        TicketSav ticket = new TicketSav();
        ticket.setReferenceTicket("REC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
        ticket.setUtilisateur(utilisateur);
        ticket.setCategorie(categorie);
        ticket.setOrigine(TicketSav.Origine.utilisateur_direct);
        ticket.setCanalContactSouhaite(TicketSav.CanalContactSouhaite.indifferent);
        ticket.setPriorite(TicketSav.Priorite.normale);
        ticket.setTitre(nouvelle.objet());
        ticket.setDescriptionInitiale(nouvelle.description());
        ticket.setStatut(TicketSav.Statut.ouvert);
        ticket.setDateCreation(maintenant);
        TicketSav sauve = tickets.save(ticket);

        enregistrerHistorique(sauve, HistoriqueTicket.TypeAction.creation, null, utilisateur, "Reclamation ouverte");
        return mapDetail(sauve);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReclamationResume> findByUtilisateur(Integer idUtilisateur) {
        return tickets.findByUtilisateur_IdUtilisateurOrderByDateCreationDesc(idUtilisateur).stream()
                .map(this::mapResume)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResult<ReclamationResume> findPage(String groupeStatut, String nomClient, String reference, int page, int pageSize) {
        PageRequest pageRequest = PageRequest.of(page - 1, pageSize, Sort.by("dateCreation").descending());
        Page<TicketSav> resultat = tickets.rechercher(
                statutsPourGroupe(groupeStatut),
                vide(nomClient) ? null : nomClient.trim(),
                vide(reference) ? null : reference.trim(),
                pageRequest);
        List<ReclamationResume> items = resultat.getContent().stream().map(this::mapResume).toList();
        return new PageResult<>(items, page, pageSize, resultat.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> countByGroupe(String nomClient, String reference) {
        // Initialise tous les groupes a 0 pour un retour stable.
        Map<String, Long> resultat = new java.util.HashMap<>();
        for (GroupeStatutReclamation g : GroupeStatutReclamation.values()) {
            resultat.put(g.name(), 0L);
        }
        for (TicketSavJpaRepository.StatutCount c : tickets.compterParStatut(
                vide(nomClient) ? null : nomClient.trim(),
                vide(reference) ? null : reference.trim())) {
            String groupe = StatutReclamation.valueOf(c.getStatut().name()).groupe().name();
            resultat.merge(groupe, c.getNb(), Long::sum);
        }
        return resultat;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Reclamation> findDetail(Integer id, Integer idProprietaire) {
        return tickets.findById(id)
                .filter(t -> idProprietaire == null || appartientA(t, idProprietaire))
                .map(this::mapDetail);
    }

    @Override
    @Transactional
    public Reclamation ajouterMessage(Integer idReclamation, String contenu, boolean parAgent, Integer idAuteur) {
        TicketSav ticket = tickets.findById(idReclamation)
                .orElseThrow(() -> new ReclamationIntrouvableException(idReclamation));

        if (parAgent) {
            Agent agent = agents.findById(idAuteur).orElseThrow(AgentIntrouvableException::new);
            enregistrerHistorique(ticket, HistoriqueTicket.TypeAction.message_agent, agent, null, contenu);
            // Premiere reponse agent : le ticket passe en cours.
            if (ticket.getStatut() == TicketSav.Statut.ouvert || ticket.getStatut() == TicketSav.Statut.reouvert) {
                ticket.setStatut(TicketSav.Statut.en_cours);
            }
            if (ticket.getDatePremierePriseEnCharge() == null) {
                ticket.setDatePremierePriseEnCharge(LocalDateTime.now());
            }
        } else {
            Utilisateur utilisateur = utilisateurs.findById(idAuteur)
                    .orElseThrow(UtilisateurIntrouvableException::new);
            enregistrerHistorique(ticket, HistoriqueTicket.TypeAction.message_utilisateur, null, utilisateur, contenu);
        }
        return mapDetail(tickets.save(ticket));
    }

    @Override
    @Transactional
    public Reclamation changerStatut(Integer idReclamation, StatutReclamation statut, Integer idAgent) {
        TicketSav ticket = tickets.findById(idReclamation)
                .orElseThrow(() -> new ReclamationIntrouvableException(idReclamation));
        Agent agent = agents.findById(idAgent).orElseThrow(AgentIntrouvableException::new);

        TicketSav.Statut nouveau = TicketSav.Statut.valueOf(statut.name());
        LocalDateTime maintenant = LocalDateTime.now();
        if (nouveau == TicketSav.Statut.resolu && ticket.getDateResolution() == null) {
            ticket.setDateResolution(maintenant);
        }
        if (nouveau == TicketSav.Statut.ferme && ticket.getDateCloture() == null) {
            ticket.setDateCloture(maintenant);
        }
        if (nouveau == TicketSav.Statut.en_cours && ticket.getDatePremierePriseEnCharge() == null) {
            ticket.setDatePremierePriseEnCharge(maintenant);
        }
        ticket.setStatut(nouveau);

        HistoriqueTicket.TypeAction type = switch (nouveau) {
            case ferme -> HistoriqueTicket.TypeAction.cloture;
            case reouvert -> HistoriqueTicket.TypeAction.reouverture;
            default -> HistoriqueTicket.TypeAction.changement_statut;
        };
        enregistrerHistorique(ticket, type, agent, null, "Statut : " + statut.name());
        return mapDetail(tickets.save(ticket));
    }

    @Override
    @Transactional
    public Reclamation assigner(Integer idReclamation, Integer idAgent) {
        TicketSav ticket = tickets.findById(idReclamation)
                .orElseThrow(() -> new ReclamationIntrouvableException(idReclamation));
        Agent agent = agents.findById(idAgent).orElseThrow(AgentIntrouvableException::new);
        ticket.setAgentAssigne(agent);
        enregistrerHistorique(ticket, HistoriqueTicket.TypeAction.reassignation, agent, null,
                "Assignee a " + agent.getPrenom() + " " + agent.getNom());
        return mapDetail(tickets.save(ticket));
    }

    // ─── helpers ────────────────────────────────────────────────────────────

    private void enregistrerHistorique(TicketSav ticket, HistoriqueTicket.TypeAction type,
                                       Agent agent, Utilisateur utilisateur, String description) {
        HistoriqueTicket entree = new HistoriqueTicket();
        entree.setTicket(ticket);
        entree.setTypeAction(type);
        entree.setAgent(agent);
        entree.setUtilisateur(utilisateur);
        entree.setDescription(description);
        entree.setDateAction(LocalDateTime.now());
        historiques.save(entree);
    }

    private Reclamation mapDetail(TicketSav ticket) {
        List<MessageReclamation> messages = new ArrayList<>();
        if (ticket.getDescriptionInitiale() != null && !ticket.getDescriptionInitiale().isBlank()) {
            messages.add(new MessageReclamation(AuteurMessage.CLIENT, ticket.getDescriptionInitiale(), ticket.getDateCreation()));
        }
        historiques.findByTicket_IdTicketAndTypeActionInOrderByDateActionAsc(ticket.getIdTicket(), TYPES_MESSAGE)
                .forEach(h -> messages.add(new MessageReclamation(
                        h.getTypeAction() == HistoriqueTicket.TypeAction.message_agent ? AuteurMessage.AGENT : AuteurMessage.CLIENT,
                        h.getDescription(),
                        h.getDateAction())));

        return new Reclamation(
                ticket.getIdTicket(),
                ticket.getReferenceTicket(),
                ticket.getCategorie().getCode(),
                ticket.getCategorie().getLibelle(),
                ticket.getTitre(),
                StatutReclamation.valueOf(ticket.getStatut().name()),
                ticket.getPriorite().name(),
                ticket.getOrigine().name(),
                nomClient(ticket),
                nomAgent(ticket),
                ticket.getDateCreation(),
                dateMiseAJour(ticket),
                messages);
    }

    private ReclamationResume mapResume(TicketSav ticket) {
        return new ReclamationResume(
                ticket.getIdTicket(),
                ticket.getReferenceTicket(),
                ticket.getTitre(),
                ticket.getCategorie().getCode(),
                ticket.getCategorie().getLibelle(),
                StatutReclamation.valueOf(ticket.getStatut().name()),
                ticket.getPriorite().name(),
                nomClient(ticket),
                nomAgent(ticket),
                ticket.getDateCreation(),
                dateMiseAJour(ticket));
    }

    private LocalDateTime dateMiseAJour(TicketSav ticket) {
        return historiques.findFirstByTicket_IdTicketOrderByDateActionDesc(ticket.getIdTicket())
                .map(HistoriqueTicket::getDateAction)
                .filter(d -> ticket.getDateCreation() == null || d.isAfter(ticket.getDateCreation()))
                .orElse(ticket.getDateCreation());
    }

    private static String nomClient(TicketSav ticket) {
        Utilisateur u = ticket.getUtilisateur();
        return u == null ? null : (u.getPrenom() + " " + u.getNom());
    }

    private static String nomAgent(TicketSav ticket) {
        Agent a = ticket.getAgentAssigne();
        return a == null ? null : (a.getPrenom() + " " + a.getNom());
    }

    private static boolean appartientA(TicketSav ticket, Integer idUtilisateur) {
        return ticket.getUtilisateur() != null
                && idUtilisateur.equals(ticket.getUtilisateur().getIdUtilisateur());
    }

    private static boolean vide(String s) {
        return s == null || s.isBlank();
    }

    /** Statuts fins correspondant au groupe demande ; tous si {@code null}. */
    private static Set<TicketSav.Statut> statutsPourGroupe(String groupe) {
        if (vide(groupe)) {
            return Arrays.stream(TicketSav.Statut.values()).collect(Collectors.toSet());
        }
        GroupeStatutReclamation cible = GroupeStatutReclamation.valueOf(groupe);
        return Arrays.stream(StatutReclamation.values())
                .filter(s -> s.groupe() == cible)
                .map(s -> TicketSav.Statut.valueOf(s.name()))
                .collect(Collectors.toSet());
    }
}
