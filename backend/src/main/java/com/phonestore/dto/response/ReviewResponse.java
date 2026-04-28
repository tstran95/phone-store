package com.phonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String title;
    private String content;
    private Boolean isVerifiedPurchase;
    private Integer helpfulCount;
    private Integer unhelpfulCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ReviewerInfo reviewer;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewerInfo {
        private Long id;
        private String fullName;
        private String avatarUrl;
    }
}
