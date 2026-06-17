package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.domain.dossier.model.Personne;

public record PersonneResponse(Integer id, String nom, String prenom, String email) {
    public static PersonneResponse from(Personne p) {
        return new PersonneResponse(p.id(), p.nom(), p.prenom(), p.email());
    }
}
