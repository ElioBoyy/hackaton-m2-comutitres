package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.PieceRequiseResume;

public record PieceRequiseResponse(String codeTypePiece, String libelleTypePiece, boolean obligatoire)
        implements Response {

    public static PieceRequiseResponse from(PieceRequiseResume r) {
        return new PieceRequiseResponse(r.codeTypePiece(), r.libelleTypePiece(), r.obligatoire());
    }
}
