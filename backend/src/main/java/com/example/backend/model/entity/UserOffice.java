package com.example.backend.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;

/**
 * User-Office mapping entity for multi-office access
 */
@Entity
@Table(name = "user_office", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "office_id"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"user", "office"})
public class UserOffice extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id", nullable = false)
    private Office office;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "assigned_at", nullable = false)
    private LocalDateTime assignedAt = LocalDateTime.now();

    public UserOffice(AppUser user, Office office) {
        this.user = user;
        this.office = office;
    }

    public UserOffice(AppUser user, Office office, boolean isPrimary) {
        this.user = user;
        this.office = office;
        this.isPrimary = isPrimary;
    }
}

