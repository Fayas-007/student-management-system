package com.fayas.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.CourseRequest;
import com.fayas.backend.dto.response.CourseResponse;
import com.fayas.backend.entity.Course;
import com.fayas.backend.entity.Department;
import com.fayas.backend.repository.CourseRepository;
import com.fayas.backend.repository.DepartmentRepository;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    public CourseService(
            CourseRepository courseRepository,
            DepartmentRepository departmentRepository) {

        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<CourseResponse> getAllCourses() {

        return courseRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CourseResponse getCourseById(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        return toResponse(course);
    }

    public CourseResponse createCourse(CourseRequest request) {

        validate(request);

        String code = request.getCode().trim().toUpperCase();

        if (courseRepository.findByCode(code).isPresent()) {
            throw new RuntimeException("Course code already exists");
        }

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        Course course = new Course();

        course.setDepartment(department);
        course.setCode(code);
        course.setName(request.getName().trim());
        course.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );
        course.setCredits(request.getCredits());

        return toResponse(courseRepository.save(course));
    }

    public CourseResponse updateCourse(Long id, CourseRequest request) {

        validate(request);

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        String code = request.getCode().trim().toUpperCase();

        if (!code.equals(course.getCode())) {

            if (courseRepository.findByCode(code).isPresent()) {
                throw new RuntimeException("Course code already exists");
            }

            course.setCode(code);
        }

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        course.setDepartment(department);
        course.setName(request.getName().trim());
        course.setDescription(
                request.getDescription() != null
                        ? request.getDescription().trim()
                        : null
        );
        course.setCredits(request.getCredits());

        return toResponse(courseRepository.save(course));
    }

    public void deleteCourse(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        courseRepository.delete(course);
    }

    private void validate(CourseRequest request) {

        if (request.getDepartmentId() == null) {
            throw new RuntimeException("Department is required");
        }

        if (request.getCode() == null || request.getCode().isBlank()) {
            throw new RuntimeException("Course code is required");
        }

        if (request.getName() == null || request.getName().isBlank()) {
            throw new RuntimeException("Course name is required");
        }

        if (request.getCredits() == null) {
            throw new RuntimeException("Credits are required");
        }

        if (request.getCredits() < 1 || request.getCredits() > 10) {
            throw new RuntimeException("Credits must be between 1 and 10");
        }
    }

    private CourseResponse toResponse(Course course) {

        CourseResponse response = new CourseResponse();

        response.setId(course.getId());
        response.setDepartmentId(course.getDepartment().getId());
        response.setCode(course.getCode());
        response.setName(course.getName());
        response.setDescription(course.getDescription());
        response.setCredits(course.getCredits());
        response.setCreatedAt(course.getCreatedAt());

        return response;
    }
}