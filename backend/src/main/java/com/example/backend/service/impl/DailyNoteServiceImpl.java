package com.example.backend.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.model.dto.DailyNoteRequestDTO;
import com.example.backend.model.dto.DailyNoteResponseDTO;
import com.example.backend.model.entity.DailyNote;
import com.example.backend.model.entity.Patient;
import com.example.backend.model.entity.Staff;
import com.example.backend.repository.DailyNoteRepository;
import com.example.backend.service.DailyNoteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyNoteServiceImpl implements DailyNoteService {

    private final DailyNoteRepository dailyNoteRepository;
    private final com.example.backend.repository.ServiceDeliveryRepository serviceDeliveryRepository;

    @Override
    @Transactional
    public DailyNoteResponseDTO create(DailyNoteRequestDTO dto) {
        // Get ServiceDelivery first
        com.example.backend.model.entity.ServiceDelivery serviceDelivery = 
            serviceDeliveryRepository.findById(dto.getServiceDeliveryId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceDelivery", dto.getServiceDeliveryId()));

        // Get Patient and Staff from ServiceDelivery's ScheduleEvent
        Patient patient = serviceDelivery.getPatient();
        Staff staff = serviceDelivery.getStaff();
        
        if (patient == null) {
            throw new ResourceNotFoundException("Patient not found in ServiceDelivery");
        }

        DailyNote note = new DailyNote();
        note.setServiceDelivery(serviceDelivery);
        note.setAuthorStaff(staff); // Staff who creates the note
        note.setPatient(patient);
        note.setStaff(staff);
        note.setContent(dto.getContent());
        note.setMealInfo(dto.getMealInfo() == null ? List.of() : List.copyOf(dto.getMealInfo()));
        note.setPatientSignature(dto.getPatientSignature());
        note.setStaffSignature(dto.getStaffSignature());
        note.setCancelled(Boolean.TRUE.equals(dto.getCancelled()));
        note.setCancelReason(dto.getCancelReason());

        DailyNote saved = dailyNoteRepository.save(note);
        log.info("Created DailyNote {} for ServiceDelivery {} - Patient: {}, Staff: {}", 
            saved.getId(), serviceDelivery.getId(), patient.getFullName(), 
            staff != null ? staff.getFirstName() + " " + staff.getLastName() : "N/A");
        return toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyNoteResponseDTO getById(UUID id) {
        DailyNote note = dailyNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DailyNote", id));
        return toDto(note);
    }

    @Override
    @Transactional
    public DailyNoteResponseDTO update(UUID id, DailyNoteRequestDTO dto) {
        DailyNote note = dailyNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DailyNote", id));

        // Update ServiceDelivery if changed
        if (!note.getServiceDelivery().getId().equals(dto.getServiceDeliveryId())) {
            com.example.backend.model.entity.ServiceDelivery serviceDelivery = 
                serviceDeliveryRepository.findById(dto.getServiceDeliveryId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceDelivery", dto.getServiceDeliveryId()));
            
            note.setServiceDelivery(serviceDelivery);
            
            // Update patient and staff from new ServiceDelivery
            Patient patient = serviceDelivery.getPatient();
            Staff staff = serviceDelivery.getStaff();
            
            note.setPatient(patient);
            note.setStaff(staff);
            note.setAuthorStaff(staff);
        }

        note.setContent(dto.getContent());
        note.setMealInfo(dto.getMealInfo() == null ? List.of() : List.copyOf(dto.getMealInfo()));
        note.setPatientSignature(dto.getPatientSignature());
        note.setStaffSignature(dto.getStaffSignature());
        note.setCancelled(Boolean.TRUE.equals(dto.getCancelled()));
        note.setCancelReason(dto.getCancelReason());

        DailyNote saved = dailyNoteRepository.save(note);
        log.info("Updated DailyNote {} for ServiceDelivery {}", saved.getId(), saved.getServiceDelivery().getId());
        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        DailyNote note = dailyNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DailyNote", id));
        dailyNoteRepository.delete(note);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DailyNoteResponseDTO> list(int page, int size) {
        var pageable = PageRequest.of(page, size);
        var p = dailyNoteRepository.findAll(pageable);
        List<DailyNoteResponseDTO> content = p.stream().map(this::toDto).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, p.getTotalElements());
    }

    private DailyNoteResponseDTO toDto(DailyNote note) {
        DailyNoteResponseDTO dto = new DailyNoteResponseDTO();
        dto.setId(note.getId());
        dto.setServiceDeliveryId(note.getServiceDelivery() != null ? note.getServiceDelivery().getId() : null);
        
        // Patient info
        if (note.getPatient() != null) {
            dto.setPatientId(note.getPatient().getId());
            dto.setPatientName(note.getPatient().getFullName());
        }
        
        // Staff info
        if (note.getStaff() != null) {
            dto.setStaffId(note.getStaff().getId());
            dto.setStaffName(note.getStaff().getFirstName() + " " + note.getStaff().getLastName());
        }
        
        dto.setContent(note.getContent());
        dto.setMealInfo(note.getMealInfo() == null ? List.of() : List.copyOf(note.getMealInfo()));
        
        // Get check-in/check-out from ServiceDelivery
        dto.setCheckInTime(note.getCheckInTime());
        dto.setCheckOutTime(note.getCheckOutTime());
        
        dto.setPatientSignature(note.getPatientSignature());
        dto.setStaffSignature(note.getStaffSignature());
        dto.setCancelled(note.getCancelled());
        dto.setCancelReason(note.getCancelReason());
        return dto;
    }
}
