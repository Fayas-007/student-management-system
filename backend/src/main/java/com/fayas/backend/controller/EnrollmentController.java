package com.fayas.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.fayas.backend.dto.request.EnrollmentRequest;
import com.fayas.backend.dto.response.EnrollmentResponse;
import com.fayas.backend.service.EnrollmentService;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    public List<EnrollmentResponse> getAllEnrollments() {
        return enrollmentService.getAllEnrollments();
    }

    @GetMapping("/{id}")
    public EnrollmentResponse getEnrollmentById(@PathVariable Long id) {
        return enrollmentService.getEnrollmentById(id);
    }

    @PostMapping
    public EnrollmentResponse createEnrollment(
            @RequestBody EnrollmentRequest request) {

        return enrollmentService.createEnrollment(request);
    }

    @DeleteMapping("/{id}")
    public void deleteEnrollment(@PathVariable Long id) {
        enrollmentService.deleteEnrollment(id);
    }
}