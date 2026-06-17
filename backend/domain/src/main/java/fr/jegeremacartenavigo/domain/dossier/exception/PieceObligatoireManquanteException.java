package fr.jegeremacartenavigo.domain.dossier.exception;

import fr.jegeremacartenavigo.domain.exception.DomainException;

/**
 * Levee quand une piece justificative obligatoire (CNI, et certificat de
 * scolarite si etudiant) manque a la creation du Dossier. La notification de
 * bourse reste toujours facultative, meme pour un etudiant boursier (cf.
 * CONTEXT.md / PreVerificationIA).
 */
public class PieceObligatoireManquanteException extends DomainException {

    public PieceObligatoireManquanteException(String message) {
        super(message);
    }
}
