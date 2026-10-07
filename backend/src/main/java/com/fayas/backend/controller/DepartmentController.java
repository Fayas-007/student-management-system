package com.fayas.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.fayas.backend.dto.request.DepartmentRequest;
import com.fayas.backend.dto.response.DepartmentResponse;
import com.fayas.backend.service.DepartmentService;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public List<DepartmentResponse> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/{id}")
    public DepartmentResponse getDepartmentById(
            @PathVariable Long id) {

        return departmentService.getDepartmentById(id);
    }

    @PostMapping
    public DepartmentResponse createDepartment(
            @RequestBody DepartmentRequest request) {

        return departmentService.createDepartment(request);
    }

    @PutMapping("/{id}")
    public DepartmentResponse updateDepartment(
            @PathVariable Long id,
            @RequestBody DepartmentRequest request) {

        return departmentService.updateDepartment(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteDepartment(
            @PathVariable Long id) {

        departmentService.deleteDepartment(id);
    }
}