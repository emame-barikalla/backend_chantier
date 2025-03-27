package com.app.chantier_back.controllers;


import com.app.chantier_back.dto.PermissionDTO;
import com.app.chantier_back.entities.Permission;
import com.app.chantier_back.services.interfaces.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/permissions")
public class PermissionController {


    private final PermissionService permissionService;

    @PostMapping("/add")
    public ResponseEntity<Permission> createPermission(@Valid @RequestBody PermissionDTO permissionDTO) {
        return ResponseEntity.ok(permissionService.createPermission(permissionDTO));
    }

    @GetMapping("/all")
    public ResponseEntity<List<PermissionDTO>> getAllPermissions() {
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }
    @GetMapping("{id}")
    public ResponseEntity<Permission> getPermissionById(@PathVariable Long id) {
        return ResponseEntity.ok(permissionService.getPermissionById(id));
    }


    @PutMapping("update/{id}")
    public ResponseEntity<Permission> updatePermission(@PathVariable Long id, @Valid @RequestBody PermissionDTO permissionDTO) {
        return ResponseEntity.ok(permissionService.updatePermission(id, permissionDTO));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deletePermission(@PathVariable Long id) {
        permissionService.deletePermission(id);
        return ResponseEntity.ok().build();
    }
}