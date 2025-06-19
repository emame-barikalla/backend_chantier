package com.app.chantier_back.security;

import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.entities.enumeration.ERole;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
// this class defines the permissions for accessing different document types based on user roles
public class DocumentPermissions {
    private static final Map<DocumentType, List<ERole>> typeToRoleMap = new HashMap<>();

    static {
        // Define which roles can access which document types
        typeToRoleMap.put(DocumentType.PLAN, List.of(

                ERole.ROLE_MAITRE_OEUVRE,
                ERole.ROLE_BUREAU_ETUDE,
                ERole.ROLE_ENTREPRISE,
                ERole.ROLE_MAITRE_OUVRAGE,
                ERole.ROLE_CONTROLEUR_TECHNIQUE,
                ERole.ROLE_SOUS_TRAITANT));

        typeToRoleMap.put(DocumentType.PV, List.of(

                ERole.ROLE_MAITRE_OEUVRE,
                ERole.ROLE_MAITRE_OUVRAGE,
                ERole.ROLE_CONTROLEUR_TECHNIQUE));

        typeToRoleMap.put(DocumentType.DOCUMENT_TECHNIQUE, List.of(

                ERole.ROLE_MAITRE_OEUVRE,
                ERole.ROLE_BUREAU_ETUDE,
                ERole.ROLE_MAITRE_OUVRAGE,
                ERole.ROLE_CONTROLEUR_TECHNIQUE));

        typeToRoleMap.put(DocumentType.CONTRAT, List.of(

                ERole.ROLE_MAITRE_OEUVRE,
                ERole.ROLE_MAITRE_OUVRAGE,
                ERole.ROLE_ENTREPRISE));

        typeToRoleMap.put(DocumentType.ETUDE, List.of(
                // ERole.ROLE_ADMIN,
                ERole.ROLE_MAITRE_OEUVRE,
                ERole.ROLE_BUREAU_ETUDE));
    }

    public static boolean canAccessDocumentType(ERole role, DocumentType type) {
        // Admin always has access
        if (role == ERole.ROLE_ADMIN) {
            return true;
        }
        return typeToRoleMap.getOrDefault(type, List.of()).contains(role);
    }

}

