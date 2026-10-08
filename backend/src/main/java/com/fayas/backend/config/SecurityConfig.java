package com.fayas.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            .authorizeHttpRequests(auth -> auth

                // ====================================================
                // OPTIONS / CORS
                // ====================================================

                .requestMatchers(
                        HttpMethod.OPTIONS,
                        "/**"
                ).permitAll()

                // ====================================================
                // AUTHENTICATION
                // ====================================================

                // Only login and register are public.
                .requestMatchers(
                        "/api/auth/login",
                        "/api/auth/register"
                ).permitAll()

                // Requires a valid authenticated user/JWT.
                .requestMatchers(
                        "/api/auth/me"
                ).authenticated()

                // ====================================================
                // USERS
                // ====================================================

                .requestMatchers(
                        "/api/users/**"
                ).hasRole("ADMIN")

                // ====================================================
                // DEPARTMENTS
                // ====================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/departments/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER",
                        "STUDENT"
                )

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/departments/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/departments/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/departments/**"
                ).hasRole("ADMIN")

                // ====================================================
                // COURSES
                // ====================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/courses/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER",
                        "STUDENT"
                )

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/courses/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER"
                )

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/courses/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER"
                )

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/courses/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER"
                )

                // ====================================================
                // ENROLLMENTS
                // ====================================================

                .requestMatchers(
                        HttpMethod.GET,
                        "/api/enrollments/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER",
                        "STUDENT"
                )

                .requestMatchers(
                        HttpMethod.POST,
                        "/api/enrollments",
                        "/api/enrollments/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.PUT,
                        "/api/enrollments/**"
                ).hasRole("ADMIN")

                .requestMatchers(
                        HttpMethod.DELETE,
                        "/api/enrollments/**"
                ).hasRole("ADMIN")

                // ====================================================
                // STUDENT SELF-SERVICE
                // ====================================================

                .requestMatchers(
                        "/api/students/me",
                        "/api/students/me/courses"
                ).hasRole("STUDENT")

                // ====================================================
                // STUDENT MANAGEMENT
                // ====================================================

                .requestMatchers(
                        "/api/students/**"
                ).hasAnyRole(
                        "ADMIN",
                        "TEACHER",
                        "STUDENT"
                )

                // ====================================================
                // EVERYTHING ELSE
                // ====================================================

                .anyRequest().authenticated()
            )

            .addFilterBefore(
                    jwtAuthenticationFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}