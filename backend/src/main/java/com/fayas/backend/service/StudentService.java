package com.fayas.backend.service;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.StudentRequest;
import com.fayas.backend.dto.response.CourseResponse;
import com.fayas.backend.dto.response.StudentResponse;
import com.fayas.backend.entity.Course;
import com.fayas.backend.entity.Enrollment;
import com.fayas.backend.entity.Student;
import com.fayas.backend.entity.User;
import com.fayas.backend.repository.EnrollmentRepository;
import com.fayas.backend.repository.StudentRepository;
import com.fayas.backend.repository.UserRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    public StudentService(
            StudentRepository studentRepository,
            UserRepository userRepository,
            EnrollmentRepository enrollmentRepository) {

        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // ============================================================
    // GET ALL STUDENTS
    // ============================================================

    public List<StudentResponse> getAllStudents() {

        return studentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // GET LOGGED-IN STUDENT PROFILE
    // ============================================================

    public StudentResponse getMyProfile(
            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Student student = studentRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        return toResponse(student);
    }

    // ============================================================
    // GET LOGGED-IN STUDENT'S COURSES
    // ============================================================

    public List<CourseResponse> getMyCourses(
            Authentication authentication) {

        // Get logged-in user's email from JWT authentication
        String email = authentication.getName();

        // Find the User
        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        // Find the Student connected to this User
        Student student = studentRepository
                .findByUserId(user.getId())
                .orElseThrow(() ->
                        new RuntimeException("Student profile not found"));

        // Find all enrollments belonging to this student
        List<Enrollment> enrollments =
                enrollmentRepository.findByStudentId(student.getId());

        // Convert enrolled courses to CourseResponse
        return enrollments
        .stream()
        .map(enrollment -> {
            Course course = enrollment.getCourse();

            if (course == null) {
                throw new RuntimeException(
                        "Enrollment has no associated course"
                );
            }

            return course;
        })
        .map(this::toCourseResponse)
        .toList();
    }

    // ============================================================
    // GET STUDENT BY ID
    // ============================================================

    public StudentResponse getStudentById(Long id) {

        Student student = studentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Student not found"));

        return toResponse(student);
    }

    // ============================================================
    // CREATE STUDENT
    // ============================================================

    public StudentResponse createStudent(
            StudentRequest request) {

        Student student = new Student();

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setAddress(request.getAddress());

        Student savedStudent =
                studentRepository.save(student);

        return toResponse(savedStudent);
    }

    // ============================================================
    // DELETE STUDENT
    // ============================================================

    public void deleteStudent(Long id) {

        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }

        studentRepository.deleteById(id);
    }

    // ============================================================
    // STUDENT → STUDENT RESPONSE
    // ============================================================

    private StudentResponse toResponse(
            Student student) {

        StudentResponse response =
                new StudentResponse();

        response.setId(student.getId());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setEmail(student.getEmail());
        response.setPhone(student.getPhone());
        response.setDateOfBirth(student.getDateOfBirth());
        response.setAddress(student.getAddress());
        response.setCreatedAt(student.getCreatedAt());

        return response;
    }

    // ============================================================
    // COURSE → COURSE RESPONSE
    // ============================================================

    private CourseResponse toCourseResponse(
            Course course) {

        CourseResponse response =
                new CourseResponse();

        response.setId(course.getId());
        response.setCode(course.getCode());
        response.setName(course.getName());
        response.setDescription(course.getDescription());
        response.setCredits(course.getCredits());

        if (course.getDepartment() != null) {
            response.setDepartmentId(
                    course.getDepartment().getId()
            );
        } else {
            response.setDepartmentId(null);
        }

        response.setCreatedAt(course.getCreatedAt());

        return response;
    }
}