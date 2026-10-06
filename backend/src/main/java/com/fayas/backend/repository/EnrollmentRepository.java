package com.fayas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fayas.backend.entity.Enrollment;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

}