package com.app.chantier_back.services;


import com.app.chantier_back.dto.PermissionDTO;
import com.app.chantier_back.entities.Permission;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.PermissionRepository;
import com.app.chantier_back.services.interfaces.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
@RequiredArgsConstructor
@Service
public class PermissionServiceImpl implements PermissionService {


    private final PermissionRepository permissionRepository;

    @Override

    public Permission createPermission(PermissionDTO permissionDTO) {
        Permission permission = new Permission();
        permission.setName(permissionDTO.getName());
        return permissionRepository.save(permission);
    }

    @Override

    public List<PermissionDTO> getAllPermissions() {
        return permissionRepository.findAll().stream()
                .map(p -> {
                    PermissionDTO dto = new PermissionDTO();
                    dto.setId(p.getId());
                    dto.setName(p.getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override

    public Permission updatePermission(Long id, PermissionDTO permissionDTO) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        permission.setName(permissionDTO.getName());
        return permissionRepository.save(permission);
    }

    @Override

    public void deletePermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        permissionRepository.delete(permission);
    }

    @Override
    public Permission getPermissionById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
    }
}
