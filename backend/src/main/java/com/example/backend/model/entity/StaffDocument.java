package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Staff document entity for versioned staff documents
 */
@Entity
@Table(name = "staff_document")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staff", "versions"})
public class StaffDocument extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "doc_type", nullable = false)
    private String docType;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "status", nullable = false)
    private String status = "active";

    // Relationships
    @OneToMany(mappedBy = "staffDocument", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<DocumentVersion> versions = new HashSet<>();

    public StaffDocument(Staff staff, String docType, String title) {
        this.staff = staff;
        this.docType = docType;
        this.title = title;
    }

    public DocumentVersion getLatestVersion() {
        return versions.stream()
                .max((v1, v2) -> Integer.compare(v1.getVersionNo(), v2.getVersionNo()))
                .orElse(null);
    }

    public boolean isActive() {
        return "active".equals(status);
    }
}

