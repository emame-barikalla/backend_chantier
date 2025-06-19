package com.app.chantier_back.controllers;

import com.app.chantier_back.dto.LoginRequest;
import com.app.chantier_back.dto.PermissionDTO;
import com.app.chantier_back.dto.RoleDTO;
import com.app.chantier_back.dto.UserResponseDTO;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.services.interfaces.AuthService;
import com.app.chantier_back.services.interfaces.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest loginRequest) {
        String token = authService.login(loginRequest);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/current-user")
    public ResponseEntity<UserResponseDTO> getCurrentUser(Authentication authentication) {
        User user = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(convertToResponseDTO(user));
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setAdresse(user.getAdresse());
        dto.setTelephone(user.getTelephone());
        dto.setRoles(user.getRoles().stream()
                .map(role -> {
                    RoleDTO roleDTO = new RoleDTO();
                    roleDTO.setId(role.getId());
                    roleDTO.setName(role.getName().name());
                    if (role.getPermissions() != null) {
                        roleDTO.setPermissions(role.getPermissions().stream()
                                .map(permission -> {
                                    PermissionDTO permissionDTO = new PermissionDTO();
                                    permissionDTO.setId(permission.getId());
                                    permissionDTO.setName(permission.getName());
                                    return permissionDTO;
                                })
                                .collect(Collectors.toSet()));
                    }
                    return roleDTO;
                })
                .collect(Collectors.toSet()));
        return dto;
    }
}


