package com.app.chantier_back.security;

import com.app.chantier_back.entities.Role;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.entities.enumeration.ERole;

import java.util.Set;

public class RoleUtils {

    private RoleUtils() {
        // Private constructor to prevent instantiation
    }

    /**
     * Check if user has a specific role
     */
    public static boolean hasRole(Set<Role> userRoles, ERole role) {
        return userRoles.stream()
                .anyMatch(r -> r.getName() == role);
    }

    /**
     * Check if user has any of the specified roles
     */
    public static boolean hasAnyRole(Set<Role> userRoles, ERole... roles) {
        for (ERole role : roles) {
            if (hasRole(userRoles, role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if user has role allowing access to a specific document type
     */
    public static boolean hasRoleForDocumentType(Set<Role> userRoles, DocumentType type) {
        // Admin can access all document types
        if (hasRole(userRoles, ERole.ROLE_ADMIN)) {
            return true;
        }

        // Check specific document type permissions using first role
        // This approach might need refinement if users can have multiple roles
        return DocumentPermissions.canAccessDocumentType(
                userRoles.stream().map(Role::getName).findFirst().orElse(null), type);
    }
}