package com.example.backend.repository;

import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByOrganizationAndUsername(Organization organization, String username);
    Optional<AppUser> findByOrganizationAndEmail(Organization organization, String email);
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
    List<AppUser> findByOrganization(Organization organization);
    List<AppUser> findByOrganizationAndDeletedAtIsNull(Organization organization);
    boolean existsByOrganizationAndUsername(Organization organization, String username);
    boolean existsByOrganizationAndEmail(Organization organization, String email);
}
