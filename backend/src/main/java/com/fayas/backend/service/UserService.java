package com.fayas.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.UserRequest;
import com.fayas.backend.dto.response.UserResponse;
import com.fayas.backend.entity.User;
import com.fayas.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user -> {
                    UserResponse response = new UserResponse();

                    response.setId(user.getId());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole());
                    response.setCreatedAt(user.getCreatedAt());

                    return response;
                })
                .toList();
    }

    public Optional<UserResponse> getUserById(Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    UserResponse response = new UserResponse();

                    response.setId(user.getId());
                    response.setEmail(user.getEmail());
                    response.setRole(user.getRole());
                    response.setCreatedAt(user.getCreatedAt());

                    return response;
                });
    }

    public UserResponse createUser(UserRequest request) {

        User user = new User();

        user.setEmail(request.getEmail());
        // user.setPasswordHash(request.getPassword());i have to hash it later
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        UserResponse response = new UserResponse();

        response.setId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setCreatedAt(savedUser.getCreatedAt());

        return response;
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}