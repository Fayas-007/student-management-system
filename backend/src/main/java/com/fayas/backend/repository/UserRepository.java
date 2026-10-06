package com.fayas.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fayas.backend.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    
}