package com.infosys.springboard.ecobazaar.repository;

import com.infosys.springboard.ecobazaar.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findByRole(String role);
    List<User> findByRoleAndBanned(String role, Boolean banned);
    List<User> findByBanned(Boolean banned);
}
