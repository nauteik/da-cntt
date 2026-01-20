package com.example.backend.service.impl;

import com.example.backend.exception.ConflictException;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.CreateISPDTO;
import com.example.backend.model.dto.ISPResponseDTO;
import com.example.backend.model.dto.UpdateISPDTO;
import com.example.backend.model.entity.FileObject;
import com.example.backend.model.entity.ISP;
import com.example.backend.model.entity.Patient;
import com.example.backend.repository.FileObjectRepository;
import com.example.backend.repository.ISPRepository;
import com.example.backend.repository.PatientRepository;
import com.example.backend.service.ISPService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ISPServiceImpl implements ISPService {

    private final ISPRepository ispRepository;
    private final PatientRepository patientRepository;
    private final FileObjectRepository fileObjectRepository;

    @Override
    @Transactional(readOnly = true)
    public ISPResponseDTO getISPByPatientId(UUID patientId) {
        // Verify patient exists
        patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Get latest ISP
        return ispRepository.findFirstByPatientIdOrderByVersionNoDesc(patientId)
            .map(this::mapToDTO)
            .orElse(null);
    }

    @Override
    @Transactional
    public ISPResponseDTO createISP(UUID patientId, CreateISPDTO dto) {
        // Verify patient exists
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + patientId));

        // Check if version number already exists for this patient
        if (ispRepository.existsByPatientIdAndVersionNo(patientId, dto.getVersionNo())) {
            throw new ConflictException("ISP version " + dto.getVersionNo() + " already exists for this patient");
        }

        // Create new ISP
        ISP isp = new ISP(patient);
        isp.setVersionNo(dto.getVersionNo());
        isp.setEffectiveAt(dto.getEffectiveAt());
        isp.setExpiresAt(dto.getExpiresAt());
        isp.setTotalUnit(dto.getTotalUnit());

        // Associate file if provided
        if (dto.getFileId() != null) {
            FileObject file = fileObjectRepository.findById(dto.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + dto.getFileId()));
            isp.setFile(file);
        }

        ISP savedISP = ispRepository.save(isp);
        log.info("Created ISP {} for patient {}", savedISP.getId(), patientId);
        
        return mapToDTO(savedISP);
    }

    @Override
    @Transactional
    public ISPResponseDTO updateISP(UUID ispId, UpdateISPDTO dto) {
        ISP isp = ispRepository.findById(ispId)
            .orElseThrow(() -> new ResourceNotFoundException("ISP not found with id: " + ispId));

        // Update version number if provided
        if (dto.getVersionNo() != null) {
            // Check if new version number conflicts with existing ISP for same patient
            if (ispRepository.existsByPatientIdAndVersionNo(isp.getPatient().getId(), dto.getVersionNo()) 
                && !dto.getVersionNo().equals(isp.getVersionNo())) {
                throw new ConflictException("ISP version " + dto.getVersionNo() + " already exists for this patient");
            }
            isp.setVersionNo(dto.getVersionNo());
        }

        // Update other fields if provided
        if (dto.getEffectiveAt() != null) {
            isp.setEffectiveAt(dto.getEffectiveAt());
        }
        if (dto.getExpiresAt() != null) {
            isp.setExpiresAt(dto.getExpiresAt());
        }
        if (dto.getTotalUnit() != null) {
            isp.setTotalUnit(dto.getTotalUnit());
        }

        // Update file association if provided
        if (dto.getFileId() != null) {
            FileObject file = fileObjectRepository.findById(dto.getFileId())
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + dto.getFileId()));
            isp.setFile(file);
        }

        ISP updatedISP = ispRepository.save(isp);
        log.info("Updated ISP {}", ispId);
        
        return mapToDTO(updatedISP);
    }

    @Override
    @Transactional
    public void deleteISP(UUID ispId) {
        ISP isp = ispRepository.findById(ispId)
            .orElseThrow(() -> new ResourceNotFoundException("ISP not found with id: " + ispId));

        ispRepository.delete(isp);
        log.info("Deleted ISP {}", ispId);
    }

    /**
     * Map ISP entity to ISPResponseDTO
     */
    private ISPResponseDTO mapToDTO(ISP isp) {
        ISPResponseDTO dto = new ISPResponseDTO();
        dto.setId(isp.getId());
        dto.setPatientId(isp.getPatient().getId());
        dto.setVersionNo(isp.getVersionNo());
        dto.setEffectiveAt(isp.getEffectiveAt());
        dto.setExpiresAt(isp.getExpiresAt());
        dto.setTotalUnit(isp.getTotalUnit());
        dto.setMetadata(isp.getMetadata());
        dto.setCreatedAt(isp.getCreatedAt());
        dto.setUpdatedAt(isp.getUpdatedAt());

        // Map file if exists
        if (isp.getFile() != null) {
            ISPResponseDTO.FileObjectDTO fileDTO = new ISPResponseDTO.FileObjectDTO();
            fileDTO.setId(isp.getFile().getId());
            fileDTO.setFilename(isp.getFile().getFilename());
            fileDTO.setMimeType(isp.getFile().getMimeType());
            fileDTO.setSizeBytes(isp.getFile().getSizeBytes());
            fileDTO.setStorageUri(isp.getFile().getStorageUri());
            dto.setFile(fileDTO);
        }

        return dto;
    }
}
