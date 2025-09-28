package com.example.backend.model.entity;

import com.example.backend.model.enums.PermissionScope;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.util.HashSet;
import java.util.Set;

/**
 * Permission entity for RBAC system
 */
@Entity
@Table(name = "permission", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"resource", "action", "scope"})
})
@Data
@EqualsAndHashCode(callSuper = true, onlyExplicitlyIncluded = true)
@NoArgsConstructor
@ToString(exclude = {"module", "rolePermissions"})
public class Permission extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(name = "resource", nullable = false)
    private String resource;

    @Column(name = "action", nullable = false)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(name = "scope", nullable = false)
    private PermissionScope scope = PermissionScope.ORG;

    @Column(name = "description")
    private String description;

    // Relationships
    @OneToMany(mappedBy = "permission", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<RolePermission> rolePermissions = new HashSet<>();

    public Permission(String resource, String action, PermissionScope scope) {
        this.resource = resource;
        this.action = action;
        this.scope = scope;
    }

    public String getPermissionKey() {
        return resource + ":" + action + ":" + scope.getValue();
    }
}

