package com.app.chantier_back.controllers;

import com.app.chantier_back.dto.ProjetUserDTO;
import com.app.chantier_back.entities.enumeration.ERole;
import com.app.chantier_back.services.ProjetUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projet-users")
@RequiredArgsConstructor
public class ProjetUserController {
    private final ProjetUserService projetUserService;

    @PostMapping("/{projetId}/users/{userId}/role/{role}")
    public ResponseEntity<ProjetUserDTO> assignUserToProject(
            @PathVariable Long projetId,
            @PathVariable Long userId,
            @PathVariable ERole role) {
        return ResponseEntity.ok(projetUserService.assignUserToProject(projetId, userId, role));
    }

    @DeleteMapping("/{projetId}/users/{userId}/role/{role}")
    public ResponseEntity<Void> removeUserFromProject(
            @PathVariable Long projetId,
            @PathVariable Long userId,
            @PathVariable ERole role) {
        projetUserService.removeUserFromProject(projetId, userId, role);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{projetId}/users")
    public ResponseEntity<List<ProjetUserDTO>> getProjectUsers(@PathVariable Long projetId) {
        return ResponseEntity.ok(projetUserService.getProjectUsers(projetId));
    }

    @GetMapping("/{projetId}/users/role/{role}")
    public ResponseEntity<List<ProjetUserDTO>> getProjectUsersByRole(
            @PathVariable Long projetId,
            @PathVariable ERole role) {
        return ResponseEntity.ok(projetUserService.getProjectUsersByRole(projetId, role));
    }

    @PutMapping("/{projetId}/users/{userId}/activate")
    public ResponseEntity<ProjetUserDTO> activateUserInProject(
            @PathVariable Long projetId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(projetUserService.activateUserInProject(projetId, userId));
    }
} 