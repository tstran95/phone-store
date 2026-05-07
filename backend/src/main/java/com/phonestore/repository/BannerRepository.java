package com.phonestore.repository;

import com.phonestore.entity.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<Banner> findByPositionAndIsActiveTrueOrderByDisplayOrderAsc(String position);

    List<Banner> findByPositionAndIsActiveTrueAndStartDateLessThanEqualAndEndDateGreaterThanEqualOrderByDisplayOrderAsc(
            String position, LocalDateTime now1, LocalDateTime now2);
}
