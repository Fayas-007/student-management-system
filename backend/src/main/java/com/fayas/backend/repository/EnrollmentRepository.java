package com.fayas.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fayas.backend.entity.Enrollment;

public interface EnrollmentRepository
        extends JpaRepository<Enrollment, Long> {

    boolean existsByStudentIdAndCourseId(
            Long studentId,
            Long courseId
    );

    List<Enrollment> findByStudentId(Long studentId);

    void deleteByCourseId(Long courseId);

    long countByCourseId(Long courseId);
}