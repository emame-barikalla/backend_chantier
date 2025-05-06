package com.app.chantier_back.dto;

import com.app.chantier_back.entities.enumeration.Category;
import com.app.chantier_back.entities.enumeration.StatusProjet;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data

public class ProjetDTO {
    private Long id;
    private String nom;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private Double budget;
    private StatusProjet status;
    private boolean isArchived = false;
    @Enumerated(EnumType.STRING)
    private Category category;
    private List<Long> tacheIds = new ArrayList<>();
    private List<Long> documentIds = new ArrayList<>();
}
