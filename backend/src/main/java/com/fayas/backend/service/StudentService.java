package com.fayas.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.fayas.backend.dto.request.StudentRequest;
import com.fayas.backend.dto.response.StudentResponse;
import com.fayas.backend.entity.Student;
import com.fayas.backend.repository.StudentRepository;

@Service
public class StudentService {

    private final StudentRepository studentRepository;

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Get all students
    public List<StudentResponse> getAllStudents() {

        return studentRepository.findAll()
                .stream()
                .map(student -> {
                    StudentResponse response = new StudentResponse();

                    response.setId(student.getId());
                    response.setFirstName(student.getFirstName());
                    response.setLastName(student.getLastName());
                    response.setEmail(student.getEmail());
                    response.setPhone(student.getPhone());
                    response.setDateOfBirth(student.getDateOfBirth());
                    response.setAddress(student.getAddress());
                    response.setCreatedAt(student.getCreatedAt());

                    return response;
                })
                .toList();
    }

    // Get one student
    public StudentResponse getStudentById(Long id) {

        Student student = studentRepository.findById(id)
                .orElseThrow();

        StudentResponse response = new StudentResponse();

        response.setId(student.getId());
        response.setFirstName(student.getFirstName());
        response.setLastName(student.getLastName());
        response.setEmail(student.getEmail());
        response.setPhone(student.getPhone());
        response.setDateOfBirth(student.getDateOfBirth());
        response.setAddress(student.getAddress());
        response.setCreatedAt(student.getCreatedAt());

        return response;
    }

    // Create student
    public StudentResponse createStudent(StudentRequest request) {

        Student student = new Student();

        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setPhone(request.getPhone());
        student.setDateOfBirth(request.getDateOfBirth());
        student.setAddress(request.getAddress());

        Student savedStudent = studentRepository.save(student);

        StudentResponse response = new StudentResponse();

        response.setId(savedStudent.getId());
        response.setFirstName(savedStudent.getFirstName());
        response.setLastName(savedStudent.getLastName());
        response.setEmail(savedStudent.getEmail());
        response.setPhone(savedStudent.getPhone());
        response.setDateOfBirth(savedStudent.getDateOfBirth());
        response.setAddress(savedStudent.getAddress());
        response.setCreatedAt(savedStudent.getCreatedAt());

        return response;
    }

    // Delete student
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}