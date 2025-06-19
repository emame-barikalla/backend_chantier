package com.app.chantier_back.dto;

import com.app.chantier_back.entities.enumeration.ERole;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class ProjetUserDTO {
    private Long id;
    private Long projetId;
    private Long userId;
    private ERole role;
    @JsonProperty("isActive")
    private boolean isActive;
    
    // Additional fields for response
    private String userNom;
    private String userPrenom;
    private String userEmail;
} 