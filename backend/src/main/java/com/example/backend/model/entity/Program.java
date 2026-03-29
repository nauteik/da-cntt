package com.example.backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "program", uniqueConstraints = {
    @UniqueConstraint(name = "uq_program_program_identifier", columnNames = {"program_identifier"})
})
public class Program extends BaseEntity {

    @Column(name = "program_identifier", nullable = false, length = 50)
    private String programIdentifier;

    @Column(name = "program_name", nullable = false, length = 255)
    private String programName;

    @Column(name = "description", columnDefinition = "text")
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
