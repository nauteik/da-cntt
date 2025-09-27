package com.example.backend.repository;

import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Role;
import com.example.backend.model.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UUID> {
    List<UserRole> findByUser(AppUser user);
    List<UserRole> findByRole(Role role);
    boolean existsByUserAndRole(AppUser user, Role role);
}
