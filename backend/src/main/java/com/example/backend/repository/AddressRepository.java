package com.example.backend.repository;

import com.example.backend.model.entity.Address;
import com.example.backend.model.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AddressRepository extends JpaRepository<Address, UUID> {
    List<Address> findByOrganization(Organization organization);
}
