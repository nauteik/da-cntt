package com.example.backend.model.entity;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "patient_payer", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"patient_id", "payer_id"})
})
public class PatientPayer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payer_id", nullable = false)
    private Payer payer;

    @Column(name = "client_payer_id", nullable = false)
    private String clientPayerId;

    @Column(name = "medicaid_id")
    private String medicaidId;

    @Column(name = "rank")
    private Integer rank;

    @Column(name = "group_no")
    private String groupNo;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Type(JsonBinaryType.class)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta;

    @OneToMany(mappedBy = "patientPayer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<ServiceAuthorization> serviceAuthorizations = new HashSet<>();
}
