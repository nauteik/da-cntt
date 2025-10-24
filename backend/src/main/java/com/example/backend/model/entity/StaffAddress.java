package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "staff_address", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"staff_id", "address_id"})
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@ToString(exclude = {"staff", "address"})
public class StaffAddress extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    @JsonIgnore
    private Staff staff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;

    public StaffAddress(Staff staff, Address address, String phone, String email) {
        this.staff = staff;
        this.address = address;
        this.phone = phone;
        this.email = email;
    }
}
