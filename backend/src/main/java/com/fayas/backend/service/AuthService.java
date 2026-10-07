package com.fayas.backend.service;

import com.fayas.backend.dto.request.LoginRequest;
import com.fayas.backend.dto.request.UserRequest;
import com.fayas.backend.dto.response.LoginResponse;
import com.fayas.backend.dto.response.UserResponse;

import com.fayas.backend.entity.User;
import com.fayas.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService) {

    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
}

    public UserResponse register(UserRequest request) {

        User user = new User();

        user.setEmail(request.getEmail());

        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        user.setRole(
                request.getRole() != null
                        ? request.getRole()
                        : "STUDENT");

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setCreatedAt(savedUser.getCreatedAt());

        return response;
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        String token = jwtService.generateToken(user.getEmail());

        LoginResponse response = new LoginResponse();

        response.setToken(token);
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());

        return response;

    }
}