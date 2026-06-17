package fr.jegeremacartenavigo.infrastructure.adapter.out.conversation;

import fr.jegeremacartenavigo.domain.rag.exception.ConversationIntrouvableException;
import fr.jegeremacartenavigo.domain.rag.model.ResultatEscalade;
import fr.jegeremacartenavigo.domain.rag.model.TourConversation;
import fr.jegeremacartenavigo.domain.rag.port.ConversationPort;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.CategorieSav;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.CategorieSavJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.HistoriqueTicket;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.HistoriqueTicketJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.MessageChatbot;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.MessageChatbotJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.SessionChatbot;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.SessionChatbotJpaRepository;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.TicketSav;
import fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav.TicketSavJpaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

/**
 * Persiste les conversations de l'assistant et leur escalade au-dessus des tables
 * SAV existantes : {@code session_chatbot} / {@code message_chatbot} pour le chat,
 * {@code ticket_sav} + {@code historique_ticket} pour l'escalade vers un humain.
 *
 * <p>Choix assume : l'escalade cree un ticket SAV (utilisateur anonyme autorise).
 * La table {@code session_chat_agent} (chat humain en direct) n'est pas alimentee
 * ici car elle impose un utilisateur ET un agent authentifies (colonnes NOT NULL),
 * ce que le widget anonyme ne fournit pas. Le ticket est le point de reprise pour
 * un agent.
 */
@Component
public class JpaConversationAdapter implements ConversationPort {

    private static final Logger log = LoggerFactory.getLogger(JpaConversationAdapter.class);

    private final SessionChatbotJpaRepository sessions;
    private final MessageChatbotJpaRepository messages;
    private final TicketSavJpaRepository tickets;
    private final CategorieSavJpaRepository categories;
    private final HistoriqueTicketJpaRepository historiques;

    public JpaConversationAdapter(SessionChatbotJpaRepository sessions,
                                  MessageChatbotJpaRepository messages,
                                  TicketSavJpaRepository tickets,
                                  CategorieSavJpaRepository categories,
                                  HistoriqueTicketJpaRepository historiques) {
        this.sessions = sessions;
        this.messages = messages;
        this.tickets = tickets;
        this.categories = categories;
        this.historiques = historiques;
    }

    @Override
    @Transactional
    public int demarrer(String canal) {
        SessionChatbot session = new SessionChatbot();
        session.setDateDebut(LocalDateTime.now());
        session.setStatut(SessionChatbot.Statut.en_cours);
        session.setCanalEntree(canalValide(canal));
        return sessions.save(session).getIdSession();
    }

    @Override
    public boolean existe(int sessionId) {
        return sessions.existsById(sessionId);
    }

    @Override
    @Transactional
    public void ajouterMessageUtilisateur(int sessionId, String contenu) {
        enregistrerMessage(sessionId, MessageChatbot.Auteur.utilisateur, contenu);
    }

    @Override
    @Transactional
    public void ajouterMessageBot(int sessionId, String contenu) {
        enregistrerMessage(sessionId, MessageChatbot.Auteur.bot, contenu);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TourConversation> historique(int sessionId) {
        return messages.findBySession_IdSessionOrderByDateMessageAscIdMessageAsc(sessionId).stream()
                .map(m -> new TourConversation(
                        m.getAuteur() == MessageChatbot.Auteur.bot
                                ? TourConversation.Role.assistant
                                : TourConversation.Role.utilisateur,
                        m.getContenu()))
                .toList();
    }

    @Override
    @Transactional
    public ResultatEscalade escalader(int sessionId, String titre, String description) {
        SessionChatbot session = sessions.findById(sessionId)
                .orElseThrow(() -> new ConversationIntrouvableException(sessionId));
        session.setStatut(SessionChatbot.Statut.escaladee);
        sessions.save(session);

        Optional<CategorieSav> categorie = categories.findByCode("AUTRE")
                .or(() -> categories.findAll().stream().findFirst());
        if (categorie.isEmpty()) {
            // Base non seedee : pas de categorie SAV de reference -> pas de ticket,
            // mais la session reste marquee escaladee.
            log.warn("Escalade session {} sans ticket : aucune categorie_sav disponible", sessionId);
            return ResultatEscalade.sansTicket();
        }

        TicketSav ticket = new TicketSav();
        String reference = "RAG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        ticket.setReferenceTicket(reference);
        ticket.setSessionChatbot(session);
        ticket.setCategorie(categorie.get());
        ticket.setOrigine(TicketSav.Origine.chatbot_escalade);
        ticket.setCanalContactSouhaite(TicketSav.CanalContactSouhaite.chat_agent);
        ticket.setPriorite(TicketSav.Priorite.normale);
        ticket.setTitre(tronquer(titre, 200));
        ticket.setDescriptionInitiale(description);
        ticket.setStatut(TicketSav.Statut.ouvert);
        ticket.setDateCreation(LocalDateTime.now());
        tickets.save(ticket);

        HistoriqueTicket histo = new HistoriqueTicket();
        histo.setTicket(ticket);
        histo.setDateAction(LocalDateTime.now());
        histo.setTypeAction(HistoriqueTicket.TypeAction.creation);
        histo.setDescription("Escalade automatique depuis le chatbot RAG");
        historiques.save(histo);

        log.info("Escalade session {} -> ticket {}", sessionId, reference);
        return ResultatEscalade.avecTicket(reference);
    }

    private void enregistrerMessage(int sessionId, MessageChatbot.Auteur auteur, String contenu) {
        MessageChatbot message = new MessageChatbot();
        message.setSession(sessions.getReferenceById(sessionId));
        message.setDateMessage(LocalDateTime.now());
        message.setAuteur(auteur);
        message.setContenu(contenu);
        message.setTypeContenu(MessageChatbot.TypeContenu.texte);
        messages.save(message);
    }

    private static SessionChatbot.CanalEntree canalValide(String canal) {
        if (canal == null) {
            return SessionChatbot.CanalEntree.web;
        }
        try {
            return SessionChatbot.CanalEntree.valueOf(canal.toLowerCase(Locale.ROOT));
        } catch (IllegalArgumentException e) {
            return SessionChatbot.CanalEntree.web;
        }
    }

    private static String tronquer(String texte, int max) {
        if (texte == null) {
            return "Demande utilisateur";
        }
        String t = texte.strip();
        return t.length() <= max ? t : t.substring(0, max - 3) + "...";
    }
}
