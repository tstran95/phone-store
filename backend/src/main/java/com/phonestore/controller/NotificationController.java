package com.phonestore.controller;

import com.phonestore.dto.response.ApiResponse;
import com.phonestore.dto.response.NotificationResponse;
import com.phonestore.dto.response.PagedResponse;
import com.phonestore.entity.User;
import com.phonestore.service.NotificationService;
import com.phonestore.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        String email = auth.getName();
        return userService.findByEmail(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success(PagedResponse.<NotificationResponse>builder()
                    .content(java.util.Collections.emptyList())
                    .pageNumber(page)
                    .pageSize(size)
                    .totalElements(0)
                    .totalPages(0)
                    .last(true)
                    .build()));
        }
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(user.getId(), page, size)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnreadNotifications() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
        }
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadNotifications(user.getId())));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.ok(ApiResponse.success(0L));
        }
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadCount(user.getId())));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized", null));
        }
        notificationService.markAsRead(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized", null));
        }
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }

    @GetMapping("/subscribe")
    public SseEmitter subscribe() {
        User user = getCurrentUser();
        if (user == null) {
            throw new RuntimeException("Unauthorized");
        }
        SseEmitter emitter = new SseEmitter(600_000L);
        Long userId = user.getId();
        emitters.put(userId, emitter);

        emitter.onCompletion(() -> emitters.remove(userId));
        emitter.onTimeout(() -> emitters.remove(userId));
        emitter.onError((e) -> emitters.remove(userId));

        try {
            emitter.send(SseEmitter.event().name("connected").data("Subscribed to notifications"));
        } catch (Exception ignored) {
        }

        return emitter;
    }

    public void sendNotification(Long userId, NotificationResponse notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name("notification").data(notification));
            } catch (Exception e) {
                emitters.remove(userId);
            }
        }
    }
}
