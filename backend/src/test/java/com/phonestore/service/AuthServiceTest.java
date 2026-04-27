package com.phonestore.service;

import com.phonestore.dto.request.LoginRequest;
import com.phonestore.dto.request.RegisterRequest;
import com.phonestore.dto.response.AuthResponse;
import com.phonestore.entity.User;
import com.phonestore.enums.Role;
import com.phonestore.enums.UserStatus;
import com.phonestore.repository.RefreshTokenRepository;
import com.phonestore.repository.UserRepository;
import com.phonestore.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .passwordHash("encodedPassword")
                .fullName("Test User")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        registerRequest = RegisterRequest.builder()
                .email("test@example.com")
                .password("password123")
                .fullName("Test User")
                .phone("0912345678")
                .build();

        loginRequest = LoginRequest.builder()
                .email("test@example.com")
                .password("password123")
                .build();
    }

    @Test
    @DisplayName("Should register new user successfully")
    void register_Success() {
        when(userRepository.existsActiveByEmail(registerRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtService.getAccessTokenExpiration()).thenReturn(86400000L);

        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        assertEquals("Bearer", response.getTokenType());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when email already exists")
    void register_EmailAlreadyExists() {
        when(userRepository.existsActiveByEmail(registerRequest.getEmail())).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> authService.register(registerRequest));

        assertEquals("Email đã được sử dụng", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should login successfully")
    void login_Success() {
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(null);
        when(userRepository.findActiveByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(testUser));
        when(jwtService.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtService.getAccessTokenExpiration()).thenReturn(86400000L);

        AuthResponse response = authService.login(loginRequest, "Chrome", "127.0.0.1");

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals(testUser.getEmail(), response.getUser().getEmail());
        verify(userRepository).updateLastLoginTime(any(), any());
    }

    @Test
    @DisplayName("Should throw exception for invalid credentials")
    void login_InvalidCredentials() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));
        when(userRepository.findActiveByEmail(loginRequest.getEmail()))
                .thenReturn(Optional.of(testUser));

        assertThrows(BadCredentialsException.class,
                () -> authService.login(loginRequest, "Chrome", "127.0.0.1"));
    }
}
