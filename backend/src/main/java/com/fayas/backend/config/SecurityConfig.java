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

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
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

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/api/auth/**").permitAll()

                // Users
                .requestMatchers("/api/users/**")
                    .hasRole("ADMIN")

                // Departments
                .requestMatchers("/api/departments/**")
                    .hasAnyRole("ADMIN", "TEACHER")

                // Courses
                .requestMatchers(HttpMethod.GET, "/api/courses/**")
                    .hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                .requestMatchers(HttpMethod.POST, "/api/courses/**")
                    .hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(HttpMethod.PUT, "/api/courses/**")
                    .hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(HttpMethod.DELETE, "/api/courses/**")
                    .hasAnyRole("ADMIN", "TEACHER")

                // Enrollments
                .requestMatchers(HttpMethod.GET, "/api/enrollments/**")
                    .hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/enrollments",
                    "/api/enrollments/**"
                )
                .hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/enrollments/**")
                    .hasRole("ADMIN")

                .requestMatchers(HttpMethod.DELETE, "/api/enrollments/**")
                    .hasRole("ADMIN")

                // Students
                .requestMatchers("/api/students/**")
                    .hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}