package com.app.chantier_back.dto;


import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;

@Data
public class RoleDTO {
    private Long id;
    @NotBlank
    private String name;
    private String description;
    private Set<PermissionDTO> permissions;
}