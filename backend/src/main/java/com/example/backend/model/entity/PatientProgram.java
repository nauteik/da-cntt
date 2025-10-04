package com.example.backend.model.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.util.Map;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "patient_program")
public class PatientProgram extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id")
    private AppUser supervisor;

    @Column(name = "enrollment_date")
    private LocalDate enrollmentDate;

    @Column(name = "status_effective_date", nullable = false)
    private LocalDate statusEffectiveDate;

    @Column(name = "soc_date")
    private LocalDate socDate;

    @Column(name = "eoc_date")
    private LocalDate eocDate;

    @Column(name = "eligibility_begin_date")
    private LocalDate eligibilityBeginDate;

    @Column(name = "eligibility_end_date")
    private LocalDate eligibilityEndDate;

    @Type(JsonBinaryType.class)
    @Column(name = "reason_for_change", columnDefinition = "jsonb")
    private Map<String, Object> reasonForChange;

    @Type(JsonBinaryType.class)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta;
}
