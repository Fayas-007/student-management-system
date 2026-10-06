package com.fayas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fayas.backend.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long>{


    
}
