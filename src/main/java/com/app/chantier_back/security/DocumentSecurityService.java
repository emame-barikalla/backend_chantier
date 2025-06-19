package com.app.chantier_back.security;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.entities.enumeration.ERole;
import com.app.chantier_back.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DocumentSecurityService {
    private final UserService userService;

    @Transactional(readOnly = true)
    public boolean hasAccessToDocument(Document document) {
        User currentUser = userService.getCurrentUser();

        // Check if user is assigned to the document's project
        boolean isUserInProject = userService.isUserInProject(currentUser.getId(), document.getProjet().getId());
        if (!isUserInProject) {
            return false;
        }

        // Check if user's roles allow access to this document type
        return RoleUtils.hasRoleForDocumentType(currentUser.getRoles(), document.getType());
    }

    @Transactional(readOnly = true)
    public boolean canUploadDocumentType(DocumentType type) {
        User currentUser = userService.getCurrentUser();

        // Determine who can upload each document type
        switch (type) {
            case PLAN, ETUDE:
                return RoleUtils.hasAnyRole(currentUser.getRoles(), ERole.ROLE_ADMIN, ERole.ROLE_MAITRE_OEUVRE, ERole.ROLE_BUREAU_ETUDE);
            case PV:
                return RoleUtils.hasAnyRole(currentUser.getRoles(), ERole.ROLE_ADMIN, ERole.ROLE_MAITRE_OEUVRE, ERole.ROLE_CONTROLEUR_TECHNIQUE);
            case DOCUMENT_TECHNIQUE:
                return RoleUtils.hasAnyRole(currentUser.getRoles(), ERole.ROLE_ADMIN, ERole.ROLE_MAITRE_OEUVRE,
                        ERole.ROLE_BUREAU_ETUDE, ERole.ROLE_CONTROLEUR_TECHNIQUE);
            case CONTRAT:
                return RoleUtils.hasAnyRole(currentUser.getRoles(), ERole.ROLE_ADMIN, ERole.ROLE_MAITRE_OEUVRE, ERole.ROLE_MAITRE_OUVRAGE);
            default:
                return false;
        }
    }
}