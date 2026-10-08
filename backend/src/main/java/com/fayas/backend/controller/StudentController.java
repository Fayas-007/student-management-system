package com.fayas.backend.controller;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.fayas.backend.dto.request.StudentRequest;
import com.fayas.backend.dto.response.CourseResponse;
import com.fayas.backend.dto.response.StudentResponse;
import com.fayas.backend.service.StudentService;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    // Get all students
    @GetMapping
    public List<StudentResponse> getAllStudents() {
        return studentService.getAllStudents();
    }

    // Get logged-in student's profile
    @GetMapping("/me")
    public StudentResponse getMyProfile(
            Authentication authentication) {

        return studentService.getMyProfile(authentication);
    }

    // Get logged-in student's enrolled courses
    @GetMapping("/me/courses")
    public List<CourseResponse> getMyCourses(
            Authentication authentication) {

        return studentService.getMyCourses(authentication);
    }

    // Get student by ID
    @GetMapping("/{id}")
    public StudentResponse getStudentById(
            @PathVariable Long id) {

        return studentService.getStudentById(id);
    }

    // Create student
    @PostMapping
    public StudentResponse createStudent(
            @RequestBody StudentRequest request) {

        return studentService.createStudent(request);
    }

    // Delete student
    @DeleteMapping("/{id}")
    public void deleteStudent(
            @PathVariable Long id) {

        studentService.deleteStudent(id);
    }
}