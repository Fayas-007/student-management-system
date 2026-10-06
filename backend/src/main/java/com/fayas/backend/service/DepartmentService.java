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

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    // Get all departments
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(department -> {
                    DepartmentResponse response = new DepartmentResponse();

                    response.setId(department.getId());
                    response.setName(department.getName());
                    response.setDescription(department.getDescription());
                    response.setCreatedAt(department.getCreatedAt());

                    return response;
                })
                .toList();
    }

    // Get one department
    public DepartmentResponse getDepartmentById(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow();

        DepartmentResponse response = new DepartmentResponse();

        response.setId(department.getId());
        response.setName(department.getName());
        response.setDescription(department.getDescription());
        response.setCreatedAt(department.getCreatedAt());

        return response;
    }

    // Create department
    public DepartmentResponse createDepartment(DepartmentRequest request) {

        Department department = new Department();

        department.setName(request.getName());
        department.setDescription(request.getDescription());

        Department savedDepartment = departmentRepository.save(department);

        DepartmentResponse response = new DepartmentResponse();

        response.setId(savedDepartment.getId());
        response.setName(savedDepartment.getName());
        response.setDescription(savedDepartment.getDescription());
        response.setCreatedAt(savedDepartment.getCreatedAt());

        return response;
    }

    // Delete department
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }
}