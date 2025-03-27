package com.app.chantier_back.services.interfaces;


import com.app.chantier_back.dto.PermissionDTO;
import com.app.chantier_back.entities.Permission;

import java.util.List;

public interface PermissionService {
    Permission createPermission(PermissionDTO permissionDTO);
    List<PermissionDTO> getAllPermissions();
    Permission updatePermission(Long id, PermissionDTO permissionDTO);
    void deletePermission(Long id);

    Permission getPermissionById(Long id);
}
