package com.phonestore.service;

import com.phonestore.dto.request.ForgotPasswordRequest;
import com.phonestore.dto.request.LoginRequest;
import com.phonestore.dto.request.RegisterRequest;
import com.phonestore.dto.request.ResetPasswordRequest;
import com.phonestore.dto.response.AuthResponse;
import com.phonestore.entity.PasswordResetToken;
import com.phonestore.entity.RefreshToken;
import com.phonestore.entity.User;
import com.phonestore.enums.Role;
import com.phonestore.enums.UserStatus;
import com.phonestore.repository.PasswordResetTokenRepository;
import com.phonestore.repository.RefreshTokenRepository;
import com.phonestore.repository.UserRepository;
import com.phonestore.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email exists
        if (userRepository.existsActiveByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng");
        }

        // Create new user
        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.save(user);

        // Generate tokens
        return generateAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String deviceInfo, String ipAddress) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            User user = userRepository.findActiveByEmail(request.getEmail())
                    .orElseThrow(() -> new BadCredentialsException("Thông tin đăng nhập không chính xác"));

            // Reset failed attempts on successful login
            userRepository.resetFailedLoginAttempts(user.getId());
            userRepository.updateLastLoginTime(user.getId(), LocalDateTime.now());

            // Create refresh token
            createRefreshToken(user, deviceInfo, ipAddress);

            return generateAuthResponse(user);

        } catch (BadCredentialsException e) {
            // Increment failed login attempts
            userRepository.findActiveByEmail(request.getEmail())
                    .ifPresent(user -> {
                        userRepository.incrementFailedLoginAttempts(user.getId());
                    });
            throw new BadCredentialsException("Thông tin đăng nhập không chính xác");
        }
    }

    @Transactional
    public AuthResponse refreshToken(String refreshTokenValue) {
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ"));

        if (refreshToken.isExpired()) {
            throw new RuntimeException("Refresh token đã hết hạn");
        }

        User user = refreshToken.getUser();
        return generateAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByTokenHash(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevokedAt(LocalDateTime.now());
                    refreshTokenRepository.save(token);
                });
    }

    @Transactional
    public void requestPasswordReset(ForgotPasswordRequest request) {
        User user = userRepository.findActiveByEmail(request.getEmail())
                .orElse(null);

        // Don't reveal if email exists for security
        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", request.getEmail());
            return;
        }

        // Delete old tokens
        passwordResetTokenRepository.deleteActiveTokensByUser(user);

        // Create new token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusHours(24))
                .build();

        passwordResetTokenRepository.save(resetToken);

        // Send email
        emailService.sendPasswordResetEmail(user.getEmail(), token);
        log.info("Password reset token created for user: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public boolean verifyResetToken(String token) {
        return passwordResetTokenRepository.findByTokenAndUsedAtIsNull(token)
                .map(PasswordResetToken::isValid)
                .orElse(false);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUsedAtIsNull(request.getToken())
                .orElseThrow(() -> new RuntimeException("Token không hợp lệ hoặc đã hết hạn"));

        if (!resetToken.isValid()) {
            throw new RuntimeException("Token đã hết hạn hoặc đã được sử dụng");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Mark token as used
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        log.info("Password reset successful for user: {}", user.getEmail());
    }

    private void createRefreshToken(User user, String deviceInfo, String ipAddress) {
        String tokenValue = UUID.randomUUID().toString();
        String tokenHash = passwordEncoder.encode(tokenValue);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    private AuthResponse generateAuthResponse(User user) {
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .roles(user.getRole().name())
                .build();

        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getAccessTokenExpiration() / 1000)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .role(user.getRole().name())
                        .permissions(Collections.singletonList("read"))
                        .build())
                .build();
    }
}
