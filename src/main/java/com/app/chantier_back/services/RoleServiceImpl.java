package com.app.chantier_back.services;

import com.app.chantier_back.dto.PermissionDTO;
import com.app.chantier_back.dto.RoleDTO;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.entities.enumeration.ERole;
import com.app.chantier_back.entities.Permission;
import com.app.chantier_back.entities.Role;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.PermissionRepository;
import com.app.chantier_back.repositories.RoleRepository;
import com.app.chantier_back.services.interfaces.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;

    @Override
    public Role createRole(RoleDTO roleDTO) {
        Role role = new Role();
        role.setName(ERole.valueOf(roleDTO.getName()));

        Set<Permission> permissions = new HashSet<>();
        if (roleDTO.getPermissions() != null) {
            permissions = roleDTO.getPermissions().stream()
                    .map(p -> permissionRepository.findById(p.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Permission not found")))
                    .collect(Collectors.toSet());
        }
        role.setPermissions(permissions);

        return roleRepository.save(role);
    }

    @Override
    public List<RoleDTO> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream()
                .map(role -> {
                    RoleDTO dto = new RoleDTO();
                    dto.setId(role.getId());
                    dto.setDescription(role.getDescription());
                    dto.setName(String.valueOf(role.getName()));

                    // Create a new set of permissions to avoid concurrent modification
                    Set<PermissionDTO> permissionDTOs = new HashSet<>();
                    for (Permission permission : role.getPermissions()) {
                        PermissionDTO pDto = new PermissionDTO();
                        pDto.setId(permission.getId());
                        pDto.setName(permission.getName());
                        permissionDTOs.add(pDto);
                    }
                    dto.setPermissions(permissionDTOs);

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public Role updateRole(Long id, RoleDTO roleDTO) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        role.setName(ERole.valueOf(roleDTO.getName()));
        role.setDescription(roleDTO.getDescription());
        Set<Permission> permissions = roleDTO.getPermissions().stream()
                .map(p -> permissionRepository.findById(p.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found")))
                .collect(Collectors.toSet());
        role.setPermissions(permissions);

        return roleRepository.save(role);
    }

    @Override
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        roleRepository.delete(role);
    }

    @Override
    public Role getRoleById(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
    }

    @Override
    public List<RoleDTO> getRolesByUser(User user) {
        List<Role> roles = roleRepository.findAll();
        
        // If user is admin, return all roles except ROLE_ADMIN
        if (user.getRoles().stream().anyMatch(role -> role.getName() == ERole.ROLE_ADMIN)) {
            return roles.stream()
                    .filter(role -> role.getName() != ERole.ROLE_ADMIN)
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        
        // For non-admin users, return only their roles
        return user.getRoles().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private RoleDTO convertToDTO(Role role) {
        RoleDTO dto = new RoleDTO();
        dto.setId(role.getId());
        dto.setDescription(role.getDescription());
        dto.setName(String.valueOf(role.getName()));

        Set<PermissionDTO> permissionDTOs = new HashSet<>();
        for (Permission permission : role.getPermissions()) {
            PermissionDTO pDto = new PermissionDTO();
            pDto.setId(permission.getId());
            pDto.setName(permission.getName());
            permissionDTOs.add(pDto);
        }
        dto.setPermissions(permissionDTOs);

        return dto;
    }

}