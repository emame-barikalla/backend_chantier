package com.app.chantier_back.dto;


import lombok.Data;

import jakarta.validation.constraints.NotBlank;

@Data
public class PermissionDTO {
    private Long id;
    @NotBlank
    private String name;
}