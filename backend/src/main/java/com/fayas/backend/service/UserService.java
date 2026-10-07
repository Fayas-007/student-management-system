package com.fayas.backend.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.UserRequest;
import com.fayas.backend.dto.response.UserResponse;
import com.fayas.backend.entity.Student;
import com.fayas.backend.entity.User;
import com.fayas.backend.repository.StudentRepository;
import com.fayas.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            UserRepository userRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // GET ALL USERS
    // =========================
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================
    // GET USER BY ID
    // =========================
    public UserResponse getUserById(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        return toResponse(user);
    }

    // =========================
    // CREATE USER
    // =========================
    public UserResponse createUser(UserRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new RuntimeException("Email is required");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new RuntimeException("Password is required");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        String role = normalizeRole(request.getRole());

        User user = new User();

        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(role);

        User savedUser = userRepository.save(user);

        if ("STUDENT".equals(role)) {
            createStudentProfile(savedUser, request);
        }

        return toResponse(savedUser);
    }

    // =========================
    // UPDATE USER
    // =========================
    public UserResponse updateUser(
            Long id,
            UserRequest request) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String oldRole = user.getRole();
        String newRole = normalizeRole(request.getRole());

        // =========================
        // ADMIN ROLE PROTECTION
        // =========================
        if ("ADMIN".equals(oldRole) && !"ADMIN".equals(newRole)) {

            long adminCount = userRepository.findAll()
                    .stream()
                    .filter(u -> "ADMIN".equals(u.getRole()))
                    .count();

            if (adminCount <= 1) {
                throw new RuntimeException(
                        "The last administrator cannot be removed. Create another administrator first."
                );
            }

            throw new RuntimeException(
                    "Administrator accounts cannot change to another role."
            );
        }

        // Update email
        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && !request.getEmail().equals(user.getEmail())) {

            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already exists");
            }

            user.setEmail(request.getEmail());
        }

        // Update role
        user.setRole(newRole);

        // Update password only if provided
        if (request.getPassword() != null
                && !request.getPassword().isBlank()) {

            user.setPasswordHash(
                    passwordEncoder.encode(request.getPassword())
            );
        }

        User savedUser = userRepository.save(user);

        Student student = studentRepository
                .findByUserId(savedUser.getId())
                .orElse(null);

        // STUDENT
        if ("STUDENT".equals(newRole)) {

            if (student == null) {
                createStudentProfile(savedUser, request);
            } else {
                updateStudentProfile(student, request);
            }

        }
        // STUDENT -> TEACHER / ADMIN
        else if ("STUDENT".equals(oldRole) && student != null) {

            studentRepository.delete(student);
        }

        return toResponse(savedUser);
    }

    // =========================
    // DELETE USER
    // =========================
    public void deleteUser(Long id) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // =========================
        // ADMIN PROTECTION
        // =========================
        if ("ADMIN".equals(user.getRole())) {

            long adminCount = userRepository.findAll()
                    .stream()
                    .filter(u -> "ADMIN".equals(u.getRole()))
                    .count();

            if (adminCount <= 1) {
                throw new RuntimeException(
                        "The last administrator cannot be deleted. Create another administrator first."
                );
            }

            throw new RuntimeException(
                    "Administrator accounts cannot be deleted."
            );
        }

        Student student = studentRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (student != null) {
            studentRepository.delete(student);
        }

        userRepository.delete(user);
    }

    // =========================
    // CREATE STUDENT PROFILE
    // =========================
    private void createStudentProfile(
            User user,
            UserRequest request) {

        Student student = new Student();

        student.setUser(user);

        student.setFirstName(
                request.getFirstName() != null
                        ? request.getFirstName()
                        : ""
        );

        student.setLastName(
                request.getLastName() != null
                        ? request.getLastName()
                        : ""
        );

        student.setEmail(user.getEmail());

        student.setPhone(request.getPhone());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setAddress(request.getAddress());

        studentRepository.save(student);
    }

    // =========================
    // UPDATE STUDENT PROFILE
    // =========================
    private void updateStudentProfile(
            Student student,
            UserRequest request) {

        if (request.getFirstName() != null) {
            student.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            student.setLastName(request.getLastName());
        }

        if (request.getPhone() != null) {
            student.setPhone(request.getPhone());
        }

        if (request.getDateOfBirth() != null) {
            student.setDateOfBirth(request.getDateOfBirth());
        }

        if (request.getAddress() != null) {
            student.setAddress(request.getAddress());
        }

        student.setEmail(student.getUser().getEmail());

        studentRepository.save(student);
    }

    // =========================
    // CONVERT USER → RESPONSE
    // =========================
    private UserResponse toResponse(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());

        Student student = studentRepository
                .findByUserId(user.getId())
                .orElse(null);

        if (student != null) {

            response.setStudentId(student.getId());
            response.setFirstName(student.getFirstName());
            response.setLastName(student.getLastName());
            response.setPhone(student.getPhone());
            response.setDateOfBirth(student.getDateOfBirth());
            response.setAddress(student.getAddress());
        }

        return response;
    }

    // =========================
    // NORMALIZE ROLE
    // =========================
    private String normalizeRole(String role) {

        if (role == null || role.isBlank()) {
            return "STUDENT";
        }

        String normalized = role.trim().toUpperCase();

        if (!normalized.equals("ADMIN")
                && !normalized.equals("TEACHER")
                && !normalized.equals("STUDENT")) {

            throw new RuntimeException("Invalid role");
        }

        return normalized;
    }
}