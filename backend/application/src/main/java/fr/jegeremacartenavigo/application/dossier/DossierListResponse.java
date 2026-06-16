package fr.jegeremacartenavigo.application.dossier;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.DossierResume;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;

import java.util.List;

public record DossierListResponse(
        List<DossierResumeResponse> dossiers,
        int page,
        int pageSize,
        long total
) implements Response {

    public static DossierListResponse from(PageResult<DossierResume> page) {
        List<DossierResumeResponse> dossiers = page.items().stream()
                .map(DossierResumeResponse::from)
                .toList();
        return new DossierListResponse(dossiers, page.page(), page.pageSize(), page.total());
    }
}
