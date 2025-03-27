package com.app.chantier_back.controllers;

import com.app.chantier_back.dto.UserDTO;
import com.app.chantier_back.dto.RoleDTO;
import com.app.chantier_back.dto.UserResponseDTO;
import com.app.chantier_back.dto.PermissionDTO;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    private final UserService userService;

    @PostMapping("/add")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        User user = userService.createUser(userDTO);
        return ResponseEntity.ok(convertToResponseDTO(user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList()));
    }

    @GetMapping("{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(convertToResponseDTO(user));
    }

    @PutMapping("update/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO userDTO) {
        User user = userService.updateUser(id, userDTO);
        return ResponseEntity.ok(convertToResponseDTO(user));
    }

    @DeleteMapping("delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setId(user.getId());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
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
