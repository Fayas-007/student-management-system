package com.fayas.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.fayas.backend.dto.request.EnrollmentRequest;
import com.fayas.backend.dto.response.EnrollmentResponse;
import com.fayas.backend.entity.Course;
import com.fayas.backend.entity.Enrollment;
import com.fayas.backend.entity.Student;
import com.fayas.backend.entity.User;
import com.fayas.backend.repository.CourseRepository;
import com.fayas.backend.repository.EnrollmentRepository;
import com.fayas.backend.repository.StudentRepository;
import com.fayas.backend.repository.UserRepository;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository,
            UserRepository userRepository) {

        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    public List<EnrollmentResponse> getAllEnrollments() {

        return enrollmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<EnrollmentResponse> getEnrollmentsForUser(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String role = user.getRole();

        if ("ADMIN".equals(role) || "TEACHER".equals(role)) {
            return getAllEnrollments();
        }

        Student student = studentRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        return enrollmentRepository
                .findByStudentId(student.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public EnrollmentResponse getEnrollmentById(Long id) {

        Enrollment enrollment = enrollmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Enrollment not found"));

        return toResponse(enrollment);
    }

    public EnrollmentResponse getEnrollmentByIdForUser(
            Long id,
            Authentication authentication) {

        Enrollment enrollment = enrollmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Enrollment not found"));

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        String role = user.getRole();

        if ("ADMIN".equals(role) || "TEACHER".equals(role)) {
            return toResponse(enrollment);
        }

        Student student = studentRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        if (!enrollment.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Access denied");
        }

        return toResponse(enrollment);
    }

    public EnrollmentResponse createEnrollment(
            EnrollmentRequest request) {

        Student student = studentRepository
                .findById(request.getStudentId())
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        Course course = courseRepository
                .findById(request.getCourseId())
                .orElseThrow(() ->
                        new RuntimeException("Course not found"));

        boolean alreadyEnrolled =
                enrollmentRepository.existsByStudentIdAndCourseId(
                        request.getStudentId(),
                        request.getCourseId()
                );

        if (alreadyEnrolled) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Student is already enrolled in this course"
            );
        }

        Enrollment enrollment = new Enrollment();

        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setGrade(request.getGrade());

        Enrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        return toResponse(savedEnrollment);
    }

    public void deleteEnrollment(Long id) {

        if (!enrollmentRepository.existsById(id)) {
            throw new RuntimeException("Enrollment not found");
        }

        enrollmentRepository.deleteById(id);
    }

    private EnrollmentResponse toResponse(
            Enrollment enrollment) {

        EnrollmentResponse response = new EnrollmentResponse();

        response.setId(enrollment.getId());
        response.setStudentId(enrollment.getStudent().getId());
        response.setCourseId(enrollment.getCourse().getId());
        response.setEnrolledAt(enrollment.getEnrolledAt());
        response.setGrade(enrollment.getGrade());

        return response;
    }
}