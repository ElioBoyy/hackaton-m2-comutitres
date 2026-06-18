package fr.jegeremacartenavigo.infrastructure.adapter.in.web.dossier;

import java.util.List;

public record SoumettreRequest(List<PieceRequest> pieces) {
    public record PieceRequest(String codeTypePiece, String cheminFichier) {}
}
