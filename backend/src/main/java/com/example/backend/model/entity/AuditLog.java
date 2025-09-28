package com.example.backend.model.entity;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Audit log entity for tracking behavior for compliance (HIPAA, audit SRS 3.1)
 */
@Entity
@Table(name = "audit_log")
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"office", "user"})
public class AuditLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "office_id")
    private Office office;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(name = "module_code", nullable = false)
    private String moduleCode;

    @Column(name = "entity_name", nullable = false)
    private String entityName;

    @Column(name = "entity_id")
    private UUID entityId;

    @Column(name = "action", nullable = false)
    private String action;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_state", columnDefinition = "jsonb")
    private Map<String, Object> beforeState = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_state", columnDefinition = "jsonb")
    private Map<String, Object> afterState = new HashMap<>();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    public AuditLog(String moduleCode, String entityName, String action) {
        this.moduleCode = moduleCode;
        this.entityName = entityName;
        this.action = action;
    }

    // Helper methods
    public boolean isCreate() {
        return "CREATE".equals(action);
    }

    public boolean isUpdate() {
        return "UPDATE".equals(action);
    }

    public boolean isDelete() {
        return "DELETE".equals(action);
    }

    public boolean isRead() {
        return "READ".equals(action);
    }

    public boolean isLogin() {
        return "LOGIN".equals(action);
    }

    public boolean isLogout() {
        return "LOGOUT".equals(action);
    }

    public boolean hasBeforeState() {
        return beforeState != null && !beforeState.isEmpty();
    }

    public boolean hasAfterState() {
        return afterState != null && !afterState.isEmpty();
    }

    public boolean isPatientModule() {
        return "PATIENT".equals(moduleCode);
    }

    public boolean isStaffModule() {
        return "STAFF".equals(moduleCode);
    }

    public boolean isBillingModule() {
        return "BILLING".equals(moduleCode);
    }

    public boolean isAdminModule() {
        return "ADMIN".equals(moduleCode);
    }
}
