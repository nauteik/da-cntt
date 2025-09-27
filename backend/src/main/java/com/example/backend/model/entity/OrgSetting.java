package com.example.backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Organization setting entity for key-value configuration at org/office level
 */
@Entity
@Table(name = "org_setting", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"organization_id", "office_id", "key"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"organization", "office"})
public class OrgSetting extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @JsonIgnore
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @Column(name = "key", nullable = false)
    private String key;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    @Column(name = "value_type", nullable = false)
    private String valueType = "string";

    @Column(name = "is_sensitive", nullable = false)
    private Boolean isSensitive = false;

    @Column(name = "updated_by")
    private UUID updatedBy;

    public OrgSetting(Organization organization, String key, String value, String valueType) {
        this.organization = organization;
        this.key = key;
        this.value = value;
        this.valueType = valueType;
    }

    // Helper methods
    public boolean isSensitiveSetting() {
        return Boolean.TRUE.equals(isSensitive);
    }

    public boolean isOrganizationLevel() {
        return office == null;
    }

    public boolean isOfficeLevel() {
        return office != null;
    }

    public boolean isStringType() {
        return "string".equals(valueType);
    }

    public boolean isIntegerType() {
        return "integer".equals(valueType);
    }

    public boolean isBooleanType() {
        return "boolean".equals(valueType);
    }

    public boolean isDecimalType() {
        return "decimal".equals(valueType);
    }

    public boolean isDateType() {
        return "date".equals(valueType);
    }

    // Type-safe getters
    public String getStringValue() {
        return isStringType() ? value : null;
    }

    public Integer getIntegerValue() {
        if (!isIntegerType() || value == null) return null;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public Boolean getBooleanValue() {
        if (!isBooleanType() || value == null) return null;
        return Boolean.parseBoolean(value);
    }

    public BigDecimal getDecimalValue() {
        if (!isDecimalType() || value == null) return null;
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public LocalDateTime getDateValue() {
        if (!isDateType() || value == null) return null;
        try {
            return LocalDateTime.parse(value);
        } catch (Exception e) {
            return null;
        }
    }

    // Type-safe setters
    public void setStringValue(String stringValue) {
        this.value = stringValue;
        this.valueType = "string";
    }

    public void setIntegerValue(Integer intValue) {
        this.value = intValue != null ? intValue.toString() : null;
        this.valueType = "integer";
    }

    public void setBooleanValue(Boolean boolValue) {
        this.value = boolValue != null ? boolValue.toString() : null;
        this.valueType = "boolean";
    }

    public void setDecimalValue(BigDecimal decimalValue) {
        this.value = decimalValue != null ? decimalValue.toString() : null;
        this.valueType = "decimal";
    }

    public void setDateValue(LocalDateTime dateValue) {
        this.value = dateValue != null ? dateValue.toString() : null;
        this.valueType = "date";
    }
}
