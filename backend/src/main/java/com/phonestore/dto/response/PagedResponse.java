package com.phonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {

    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;
    private int totalPages;
    private boolean last;

    public static <T> PagedResponse<T> empty() {
        PagedResponse<T> response = new PagedResponse<>();
        response.setContent(List.of());
        response.setPageNumber(0);
        response.setPageSize(20);
        response.setTotalElements(0);
        response.setTotalPages(0);
        response.setLast(true);
        return response;
    }
}
