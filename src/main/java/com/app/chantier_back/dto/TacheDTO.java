package com.app.chantier_back.dto;


import com.app.chantier_back.entities.enumeration.StatutTache;
import lombok.Data;

import java.time.LocalDate;

@Data

    public class TacheDTO {
        private Long id;
        private String description;
        private StatutTache statut;
        private LocalDate date;
        private Long projetId;
        private String projetNom;
        private Long assigneeId;
        private String assigneeNom;

    }

