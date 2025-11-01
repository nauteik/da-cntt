package com.example.backend.service.impl;

import com.example.backend.model.dto.RoleDTO;
import com.example.backend.model.entity.Role;
import com.example.backend.repository.RoleRepository;
import com.example.backend.service.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of RoleService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleDTO> getActiveRoles() {
        log.info("Fetching active roles for select dropdown");
        List<Role> activeRoles = roleRepository.findByDeletedAtIsNull();
        
        return activeRoles.stream()
                .sorted((r1, r2) -> r1.getName().compareTo(r2.getName()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Map Role entity to RoleDTO
     */
    private RoleDTO mapToDTO(Role role) {
        return new RoleDTO(
                role.getId(),
                role.getCode(),
                role.getName(),
                role.getDescription(),
                role.getIsSystem()
        );
    }
}
