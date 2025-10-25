package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

/**
 * Staff contact entity for emergency contact info
 */
@Entity
@Table(name = "staff_contact")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"staff"})
public class StaffContact extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @Column(name = "relation", nullable = false)
    private String relation;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "line1")
    private String line1;

    @Column(name = "line2")
    private String line2;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    public StaffContact(Staff staff, String relation, String name) {
        this.staff = staff;
        this.relation = relation;
        this.name = name;
    }

    // Helper methods
    public boolean isPrimaryContact() {
        return Boolean.TRUE.equals(isPrimary);
    }
}
