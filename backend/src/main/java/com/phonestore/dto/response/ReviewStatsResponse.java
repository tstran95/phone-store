package com.phonestore.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Map;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewStatsResponse {

    private BigDecimal averageRating;
    private Long totalReviews;
    private Map<Integer, Long> ratingDistribution;
    private Boolean canReview;
}
