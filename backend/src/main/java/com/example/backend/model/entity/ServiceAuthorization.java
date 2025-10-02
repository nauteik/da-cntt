package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.Generated;
import org.hibernate.annotations.Type;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

/**
 * Service authorization entity for managing unit limits and consumption
 */
@Entity
@Table(name = "service_authorization")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"patientPayer", "serviceType", "isp"})
public class ServiceAuthorization extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_payer_id", nullable = false)
    @JsonIgnore
    private PatientPayer patientPayer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_type_id", nullable = false)
    private ServiceType serviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "isp_id")
    @JsonIgnore
    private ISP isp;

    @Column(name = "authorization_no", nullable = false, unique = true)
    private String authorizationNo;

    @Column(name = "format")
    private String format = "units";

    @Column(name = "event_code")
    private String eventCode;

    @Type(JsonBinaryType.class)
    @Column(name = "modifiers", columnDefinition = "jsonb")
    private Map<String, Object> modifiers;

    @Column(name = "max_units", nullable = false, precision = 10, scale = 2)
    private BigDecimal maxUnits;

    @Column(name = "total_used", precision = 10, scale = 2)
    private BigDecimal totalUsed = BigDecimal.ZERO;

    @Column(name = "total_missed", precision = 10, scale = 2)
    private BigDecimal totalMissed = BigDecimal.ZERO;

    @Generated
    @Column(name = "total_remaining", precision = 10, scale = 2)
    private BigDecimal totalRemaining;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "comments", columnDefinition = "text")
    private String comments;


    @Type(JsonBinaryType.class)
    @Column(name = "meta", columnDefinition = "jsonb")
    private Map<String, Object> meta;

}

