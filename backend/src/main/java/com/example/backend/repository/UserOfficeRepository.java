package com.example.backend.repository;

import com.example.backend.model.entity.AppUser;
import com.example.backend.model.entity.Office;
import com.example.backend.model.entity.UserOffice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserOfficeRepository extends JpaRepository<UserOffice, UUID> {
    List<UserOffice> findByUser(AppUser user);
    List<UserOffice> findByOffice(Office office);
    boolean existsByUserAndOffice(AppUser user, Office office);
}
