package com.phonestore.dto.request;

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
public class BannerRequest {

    private String title;
    private String description;
    private String imageUrl;
    private String linkUrl;
    private String buttonText;
    private Integer displayOrder;
    private Boolean isActive;
    private String position;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}
