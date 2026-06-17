package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageChatbotJpaRepository extends JpaRepository<MessageChatbot, Integer> {

    /** Messages d'une session, du plus ancien au plus recent. */
    List<MessageChatbot> findBySession_IdSessionOrderByDateMessageAscIdMessageAsc(Integer idSession);
}
