package com.fayas.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.fayas.backend.dto.request.CourseRequest;
import com.fayas.backend.dto.response.CourseResponse;
import com.fayas.backend.service.CourseService;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseResponse> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/{id}")
    public CourseResponse getCourseById(@PathVariable Long id) {
        return courseService.getCourseById(id);
    }

    // Get number of students enrolled in a course
    @GetMapping("/{id}/enrollment-count")
    public long getEnrollmentCount(@PathVariable Long id) {
        return courseService.getEnrollmentCount(id);
    }

    @PostMapping
    public CourseResponse createCourse(
            @RequestBody CourseRequest request) {
        return courseService.createCourse(request);
    }

    @PutMapping("/{id}")
    public CourseResponse updateCourse(
            @PathVariable Long id,
            @RequestBody CourseRequest request) {
        return courseService.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }
}