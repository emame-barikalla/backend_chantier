package com.app.chantier_back.dto;

import com.app.chantier_back.entities.Status;
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
    private Status status;
    private List<Long> tacheIds = new ArrayList<>();
}
