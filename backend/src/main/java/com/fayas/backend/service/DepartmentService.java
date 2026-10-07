package com.fayas.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.DepartmentRequest;
import com.fayas.backend.dto.response.DepartmentResponse;
import com.fayas.backend.entity.Department;
import com.fayas.backend.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository) {

        this.departmentRepository = departmentRepository;
    }

    // ============================================================
    // GET ALL
    // ============================================================

    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    public DepartmentResponse getDepartmentById(Long id) {

        Department department = departmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        return toResponse(department);
    }

    // ============================================================
    // CREATE
    // ============================================================

    public DepartmentResponse createDepartment(
            DepartmentRequest request) {

        Department department = new Department();

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department savedDepartment =
                departmentRepository.save(department);

        return toResponse(savedDepartment);
    }

    // ============================================================
    // UPDATE
    // ============================================================

    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request) {

        Department department = departmentRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department updatedDepartment =
                departmentRepository.save(department);

        return toResponse(updatedDepartment);
    }

    // ============================================================
    // DELETE
    // ============================================================

    public void deleteDepartment(Long id) {

        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found");
        }

        departmentRepository.deleteById(id);
    }

    // ============================================================
    // RESPONSE MAPPER
    // ============================================================

    private DepartmentResponse toResponse(
            Department department) {

        DepartmentResponse response =
                new DepartmentResponse();

        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setCreatedAt(department.getCreatedAt());

        return response;
    }
}