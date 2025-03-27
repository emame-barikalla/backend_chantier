package com.app.chantier_back.services.interfaces;



import com.app.chantier_back.dto.RoleDTO;
import com.app.chantier_back.entities.Role;

import java.util.List;

public interface RoleService {
    Role createRole(RoleDTO roleDTO);
    List<RoleDTO> getAllRoles();
    Role updateRole(Long id, RoleDTO roleDTO);
    void deleteRole(Long id);

    Role getRoleById(Long id);
}
