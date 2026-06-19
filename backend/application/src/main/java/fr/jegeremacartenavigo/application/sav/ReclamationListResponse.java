package fr.jegeremacartenavigo.application.sav;

import fr.jegeremacartenavigo.application.cqrs.Response;
import fr.jegeremacartenavigo.domain.dossier.model.PageResult;
import fr.jegeremacartenavigo.domain.sav.model.ReclamationResume;

import java.util.List;

public record ReclamationListResponse(
        List<ReclamationResumeResponse> reclamations,
        int page,
        int pageSize,
        long total
) implements Response {

    public static ReclamationListResponse from(PageResult<ReclamationResume> page) {
        List<ReclamationResumeResponse> items = page.items().stream()
                .map(ReclamationResumeResponse::from)
                .toList();
        return new ReclamationListResponse(items, page.page(), page.pageSize(), page.total());
    }

    /** Liste non paginee (suivi client). */
    public static ReclamationListResponse of(List<ReclamationResume> resumes) {
        List<ReclamationResumeResponse> items = resumes.stream()
                .map(ReclamationResumeResponse::from)
                .toList();
        return new ReclamationListResponse(items, 1, items.size(), items.size());
    }
}
