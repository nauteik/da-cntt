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
import com.example.backend.repository.PatientRepository;
import com.example.backend.repository.StaffRepository;
import com.example.backend.service.DailyNoteService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DailyNoteServiceImpl implements DailyNoteService {

    private final DailyNoteRepository dailyNoteRepository;
    private final PatientRepository patientRepository;
    private final StaffRepository staffRepository;

    @Override
    @Transactional
    public DailyNoteResponseDTO create(DailyNoteRequestDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));

        Staff staff = null;
        if (dto.getStaffId() != null) {
            staff = staffRepository.findById(dto.getStaffId())
                    .orElseThrow(() -> new ResourceNotFoundException("Staff", dto.getStaffId()));
        }

        DailyNote note = new DailyNote();
        note.setPatient(patient);
        note.setStaff(staff);
        note.setContent(dto.getContent());
        note.setCheckInTime(dto.getCheckInTime());
        note.setCheckOutTime(dto.getCheckOutTime());
        note.setCheckInLocation(dto.getCheckInLocation());
        note.setCheckOutLocation(dto.getCheckOutLocation());
        note.setMealInfo(dto.getMealInfo() == null ? List.of() : List.copyOf(dto.getMealInfo()));
        note.setPatientSignature(dto.getPatientSignature());
        note.setStaffSignature(dto.getStaffSignature());
        note.setCancelled(Boolean.TRUE.equals(dto.getCancelled()));
        note.setCancelReason(dto.getCancelReason());

        DailyNote saved = dailyNoteRepository.save(note);
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

        if (!note.getPatient().getId().equals(dto.getPatientId())) {
            Patient patient = patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient", dto.getPatientId()));
            note.setPatient(patient);
        }

        if (dto.getStaffId() != null) {
            if (note.getStaff() == null || !note.getStaff().getId().equals(dto.getStaffId())) {
                Staff staff = staffRepository.findById(dto.getStaffId())
                        .orElseThrow(() -> new ResourceNotFoundException("Staff", dto.getStaffId()));
                note.setStaff(staff);
            }
        } else {
            note.setStaff(null);
        }

        note.setContent(dto.getContent());
        note.setCheckInTime(dto.getCheckInTime());
        note.setCheckOutTime(dto.getCheckOutTime());
        note.setCheckInLocation(dto.getCheckInLocation());
        note.setCheckOutLocation(dto.getCheckOutLocation());
        note.setMealInfo(dto.getMealInfo() == null ? List.of() : List.copyOf(dto.getMealInfo()));
        note.setPatientSignature(dto.getPatientSignature());
        note.setStaffSignature(dto.getStaffSignature());
        note.setCancelled(Boolean.TRUE.equals(dto.getCancelled()));
        note.setCancelReason(dto.getCancelReason());

        DailyNote saved = dailyNoteRepository.save(note);
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
        dto.setPatientId(note.getPatient() != null ? note.getPatient().getId() : null);
        dto.setStaffId(note.getStaff() != null ? note.getStaff().getId() : null);
        dto.setContent(note.getContent());
        dto.setCheckInTime(note.getCheckInTime());
        dto.setCheckOutTime(note.getCheckOutTime());
        dto.setCheckInLocation(note.getCheckInLocation());
        dto.setCheckOutLocation(note.getCheckOutLocation());
        dto.setMealInfo(note.getMealInfo() == null ? List.of() : List.copyOf(note.getMealInfo()));
        dto.setPatientSignature(note.getPatientSignature());
        dto.setStaffSignature(note.getStaffSignature());
        dto.setCancelled(note.getCancelled());
        dto.setCancelReason(note.getCancelReason());
        return dto;
    }
}
