package com.example.backend.service.impl;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.AuthorizationDetailDTO;
import com.example.backend.model.dto.AuthorizationSearchDTO;
import com.example.backend.model.dto.AuthorizationSearchProjection;
import com.example.backend.model.dto.AuthorizationSearchRequestDTO;
import com.example.backend.model.dto.UpdateAuthorizationDTO;
import com.example.backend.model.entity.Authorization;
import com.example.backend.model.entity.PatientPayer;
import com.example.backend.model.entity.PatientService;
import com.example.backend.repository.AuthorizationRepository;
import com.example.backend.repository.PatientPayerRepository;
import com.example.backend.repository.PatientServiceRepository;
import com.example.backend.service.AuthorizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of AuthorizationService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthorizationServiceImpl implements AuthorizationService {

    private final AuthorizationRepository authorizationRepository;
    private final PatientPayerRepository patientPayerRepository;
    private final PatientServiceRepository patientServiceRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AuthorizationSearchDTO> searchAuthorizations(AuthorizationSearchRequestDTO request, Pageable pageable) {
        log.info("Searching authorizations with filters: startDate={}, endDate={}, payerId={}, supervisorId={}, programId={}, serviceTypeId={}, authorizationNo={}, clientId={}, clientFirstName={}, clientLastName={}, status={}",
            request.getStartDate(), request.getEndDate(), request.getPayerId(), request.getSupervisorId(),
            request.getProgramId(), request.getServiceTypeId(), request.getAuthorizationNo(),
            request.getClientId(), request.getClientFirstName(), request.getClientLastName(),
            request.getStatus());

        // Determine sort column and direction
        String sortColumn = null;
        String sortDirection = "asc";
        
        if (pageable.getSort().isSorted()) {
            var sort = pageable.getSort().iterator().next();
            sortColumn = sort.getProperty();
            sortDirection = sort.getDirection().name().toLowerCase();
        }

        // Calculate offset
        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();

        // Fetch filtered results using interface projection
        List<AuthorizationSearchProjection> projections = authorizationRepository.findAuthorizationsWithFilters(
            request.getStartDate(),
            request.getEndDate(),
            request.getPayerId(),
            request.getSupervisorId(),
            request.getProgramId(),
            request.getServiceTypeId(),
            request.getAuthorizationNo(),
            request.getClientId(),
            request.getClientFirstName(),
            request.getClientLastName(),
            request.getStatus(),
            sortColumn,
            sortDirection,
            limit,
            offset
        );

        // Convert interface projections to DTOs
        List<AuthorizationSearchDTO> content = projections.stream()
            .map(proj -> {
                AuthorizationSearchDTO dto = new AuthorizationSearchDTO();
                dto.setAuthorizationId(proj.getAuthorizationId());
                dto.setAuthorizationNo(proj.getAuthorizationNo());
                dto.setClientId(proj.getClientId());
                dto.setClientFirstName(proj.getClientFirstName());
                dto.setClientLastName(proj.getClientLastName());
                dto.setClientName(proj.getClientName());
                dto.setPayerName(proj.getPayerName());
                dto.setPayerIdentifier(proj.getPayerIdentifier());
                dto.setSupervisorName(proj.getSupervisorName());
                dto.setProgramIdentifier(proj.getProgramIdentifier());
                dto.setServiceCode(proj.getServiceCode());
                dto.setServiceName(proj.getServiceName());
                dto.setStartDate(proj.getStartDate());
                dto.setEndDate(proj.getEndDate());
                dto.setMaxUnits(proj.getMaxUnits());
                dto.setTotalUsed(proj.getTotalUsed());
                dto.setTotalRemaining(proj.getTotalRemaining());
                dto.setFormat(proj.getFormat());
                dto.setStatus(proj.getStatus());
                return dto;
            })
            .collect(Collectors.toList());

        // Count total results
        long total = authorizationRepository.countAuthorizationsWithFilters(
            request.getStartDate(),
            request.getEndDate(),
            request.getPayerId(),
            request.getSupervisorId(),
            request.getProgramId(),
            request.getServiceTypeId(),
            request.getAuthorizationNo(),
            request.getClientId(),
            request.getClientFirstName(),
            request.getClientLastName(),
            request.getStatus()
        );

        log.info("Found {} authorizations out of {} total (page {}/{})",
            content.size(), total, pageable.getPageNumber() + 1, (int) Math.ceil((double) total / limit));

        return new PageImpl<>(content, pageable, total);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthorizationDetailDTO getAuthorizationById(java.util.UUID id) {
        log.info("Getting authorization details for ID: {}", id);

        Authorization authorization = authorizationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Authorization", id));

        // Build DTO with patient and payer information
        AuthorizationDetailDTO dto = new AuthorizationDetailDTO();
        dto.setAuthorizationId(authorization.getId());
        dto.setAuthorizationNo(authorization.getAuthorizationNo());
        dto.setFormat(authorization.getFormat());
        dto.setStartDate(authorization.getStartDate());
        dto.setEndDate(authorization.getEndDate());
        dto.setMaxUnits(authorization.getMaxUnits());
        dto.setComments(authorization.getComments());

        // Get patient information
        if (authorization.getPatient() != null) {
            dto.setPatientId(authorization.getPatient().getId());
            dto.setClientId(authorization.getPatient().getClientId());
            dto.setClientName(authorization.getPatient().getFirstName() + " " + authorization.getPatient().getLastName());
        }

        // Get payer identifier
        if (authorization.getPatientPayer() != null && authorization.getPatientPayer().getPayer() != null) {
            dto.setPayerIdentifier(authorization.getPatientPayer().getPayer().getPayerIdentifier());
        }

        log.info("Successfully retrieved authorization details for ID: {}", id);
        return dto;
    }

    @Override
    @Transactional
    public AuthorizationDetailDTO updateAuthorization(java.util.UUID id, UpdateAuthorizationDTO updateDTO) {
        log.info("Updating authorization ID: {}", id);

        // Find authorization
        Authorization authorization = authorizationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Authorization", id));

        // Update authorization number if provided
        if (updateDTO.getAuthorizationNo() != null) {
            String authorizationNo = updateDTO.getAuthorizationNo().trim();
            // Check if authorization number already exists for another authorization
            if (!authorization.getAuthorizationNo().equals(authorizationNo)) {
                authorizationRepository.findByAuthorizationNo(authorizationNo)
                    .ifPresent(existingAuth -> {
                        if (!existingAuth.getId().equals(id)) {
                            log.warn("Attempt to update authorization with duplicate authorization number: {}", authorizationNo);
                            throw new IllegalArgumentException("Authorization number '" + authorizationNo + "' already exists");
                        }
                    });
            }
            authorization.setAuthorizationNo(authorizationNo);
        }

        // Update format if provided
        if (updateDTO.getFormat() != null) {
            authorization.setFormat(updateDTO.getFormat().trim());
        }

        // Update patient service if provided
        if (updateDTO.getPatientServiceId() != null) {
            PatientService patientService = patientServiceRepository.findById(updateDTO.getPatientServiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient Service", updateDTO.getPatientServiceId()));
            authorization.setPatientService(patientService);
        }

        // Update patient payer if provided
        if (updateDTO.getPatientPayerId() != null) {
            PatientPayer patientPayer = patientPayerRepository.findById(updateDTO.getPatientPayerId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient Payer", updateDTO.getPatientPayerId()));
            authorization.setPatientPayer(patientPayer);
        }

        // Update event code if provided
        if (updateDTO.getEventCode() != null) {
            authorization.setEventCode(updateDTO.getEventCode().trim());
        }

        // Update max units if provided
        if (updateDTO.getMaxUnits() != null) {
            if (updateDTO.getMaxUnits().compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("Max units must be non-negative");
            }
            authorization.setMaxUnits(updateDTO.getMaxUnits());
        }

        // Update start date if provided
        if (updateDTO.getStartDate() != null) {
            authorization.setStartDate(updateDTO.getStartDate());
        }

        // Update end date if provided
        if (updateDTO.getEndDate() != null) {
            authorization.setEndDate(updateDTO.getEndDate());
        }

        // Validate dates
        if (authorization.getStartDate() != null && authorization.getEndDate() != null &&
            authorization.getStartDate().isAfter(authorization.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        // Update comments if provided
        if (updateDTO.getComments() != null) {
            authorization.setComments(updateDTO.getComments().trim());
        }

        // Save authorization
        try {
            authorizationRepository.save(authorization);
            log.info("Successfully updated authorization ID: {}", id);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Data integrity violation while updating authorization {}: {}", id, ex.getMessage());
            throw new IllegalArgumentException("Update failed due to constraint violation: " + ex.getMessage());
        }

        // Return updated authorization details
        return getAuthorizationById(id);
    }
}

