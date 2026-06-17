package fr.jegeremacartenavigo.domain.auth.model;

public record AdresseDomicile(
        String numeroEtVoie,
        String codePostal,
        String ville,
        String departementCode,
        String departementLibelle
) {
}
