package fr.jegeremacartenavigo.infrastructure.adapter.out.persistence.sav;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface HistoriqueTicketJpaRepository extends JpaRepository<HistoriqueTicket, Integer> {

    /** Entrees d'un ticket d'un certain type (ex. les messages), ordre chronologique. */
    List<HistoriqueTicket> findByTicket_IdTicketAndTypeActionInOrderByDateActionAsc(
            Integer idTicket, Collection<HistoriqueTicket.TypeAction> types);

    /** Derniere action sur le ticket (sert a calculer la date de mise a jour). */
    Optional<HistoriqueTicket> findFirstByTicket_IdTicketOrderByDateActionDesc(Integer idTicket);
}
