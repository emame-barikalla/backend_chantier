package com.app.chantier_back.dto;


import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;

@Data
public class UserDTO {
    private Long id;
    @NotBlank
    private String nom;
    private String prenom;
    @NotBlank
    private String telephone;
    @NotBlank
    private String email;
    @NotBlank
    private String password;

    private String adresse;
    private Set<RoleDTO> roles;
    private Set<TacheDTO> taches;


}
