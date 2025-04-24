package com.app.chantier_back.dto;


import com.app.chantier_back.entities.Statut;
import lombok.Data;

import java.time.LocalDate;

@Data

    public class TacheDTO {
        private Long id;
        private String description;
        private Statut statut;
        private LocalDate date;
        private Long projetId;
        private Long assigneeId;
    }

