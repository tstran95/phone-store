package com.phonestore.service;

import com.phonestore.dto.response.UserResponse;
import com.phonestore.entity.User;
import com.phonestore.enums.Role;
import com.phonestore.enums.UserStatus;
import com.phonestore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findActiveByEmail(email);
    }

    @Transactional(readOnly = true)
    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    // ==================== ADMIN METHODS ====================

    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsersForAdmin(String search, String role, Pageable pageable) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("email")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("fullName")), "%" + search.toLowerCase() + "%"),
                        cb.like(cb.lower(root.get("phone")), "%" + search.toLowerCase() + "%")
                ));
            }

            if (role != null && !role.isEmpty()) {
                predicates.add(cb.equal(root.get("role"), Role.valueOf(role)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return userRepository.findAll(spec, pageable)
                .map(this::mapToUserResponse);
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToUserResponse(user);
    }

    @Transactional
    public UserResponse updateUserStatus(Long id, String statusStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(UserStatus.valueOf(statusStr));
        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, String roleStr) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(Role.valueOf(roleStr));
        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Transactional(readOnly = true)
    public long countUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public long countNewUsersToday() {
        LocalDateTime today = LocalDate.now().atStartOfDay();
        return userRepository.countByCreatedAtAfter(today);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .emailVerified(user.getEmailVerifiedAt() != null)
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .totalOrders(0)
                .totalSpent(BigDecimal.ZERO)
                .build();
    }
}
