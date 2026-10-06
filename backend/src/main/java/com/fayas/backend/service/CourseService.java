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
                .map(course -> {
                    CourseResponse response = new CourseResponse();

                    response.setId(course.getId());
                    response.setDepartmentId(course.getDepartment().getId());
                    response.setCode(course.getCode());
                    response.setName(course.getName());
                    response.setDescription(course.getDescription());
                    response.setCredits(course.getCredits());
                    response.setCreatedAt(course.getCreatedAt());

                    return response;
                })
                .toList();
    }

    public CourseResponse getCourseById(Long id) {

        Course course = courseRepository.findById(id)
                .orElseThrow();

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

    public CourseResponse createCourse(CourseRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId()).orElseThrow();

        Course course = new Course();
        course.setDepartment(department);
        course.setName(request.getName());
        course.setCode(request.getCode());
        course.setDescription(request.getDescription());
        course.setCredits(request.getCredits());

        Course savedCourse = courseRepository.save(course);

        CourseResponse response = new CourseResponse();
        response.setId(savedCourse.getId());
        response.setDepartmentId(savedCourse.getDepartment().getId());
        response.setName(savedCourse.getName());
        response.setCode(savedCourse.getCode());
        response.setDescription(savedCourse.getDescription());
        response.setCredits(savedCourse.getCredits());
        response.setCreatedAt(savedCourse.getCreatedAt());
        return response;
    }

    public void deleteCourse(Long id) {
        courseRepository.deleteById(id);
    }
}