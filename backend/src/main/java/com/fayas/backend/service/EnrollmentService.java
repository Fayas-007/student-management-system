package com.fayas.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.EnrollmentRequest;
import com.fayas.backend.dto.response.EnrollmentResponse;
import com.fayas.backend.entity.Course;
import com.fayas.backend.entity.Enrollment;
import com.fayas.backend.entity.Student;
import com.fayas.backend.repository.CourseRepository;
import com.fayas.backend.repository.EnrollmentRepository;
import com.fayas.backend.repository.StudentRepository;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentRepository studentRepository,
            CourseRepository courseRepository) {

        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public List<EnrollmentResponse> getAllEnrollments() {

        return enrollmentRepository.findAll()
                .stream()
                .map(enrollment -> {

                    EnrollmentResponse response = new EnrollmentResponse();

                    response.setId(enrollment.getId());
                    response.setStudentId(enrollment.getStudent().getId());
                    response.setCourseId(enrollment.getCourse().getId());
                    response.setEnrolledAt(enrollment.getEnrolledAt());
                    response.setGrade(enrollment.getGrade());

                    return response;
                })
                .toList();
    }

    public EnrollmentResponse getEnrollmentById(Long id) {

        Enrollment enrollment = enrollmentRepository
                .findById(id)
                .orElseThrow();

        EnrollmentResponse response = new EnrollmentResponse();

        response.setId(enrollment.getId());
        response.setStudentId(enrollment.getStudent().getId());
        response.setCourseId(enrollment.getCourse().getId());
        response.setEnrolledAt(enrollment.getEnrolledAt());
        response.setGrade(enrollment.getGrade());

        return response;
    }

    public EnrollmentResponse createEnrollment(EnrollmentRequest request) {

        Student student = studentRepository
                .findById(request.getStudentId())
                .orElseThrow();

        Course course = courseRepository
                .findById(request.getCourseId())
                .orElseThrow();

        Enrollment enrollment = new Enrollment();

        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setGrade(request.getGrade());

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);

        EnrollmentResponse response = new EnrollmentResponse();

        response.setId(savedEnrollment.getId());
        response.setStudentId(savedEnrollment.getStudent().getId());
        response.setCourseId(savedEnrollment.getCourse().getId());
        response.setEnrolledAt(savedEnrollment.getEnrolledAt());
        response.setGrade(savedEnrollment.getGrade());

        return response;
    }

    public void deleteEnrollment(Long id) {
        enrollmentRepository.deleteById(id);
    }
}