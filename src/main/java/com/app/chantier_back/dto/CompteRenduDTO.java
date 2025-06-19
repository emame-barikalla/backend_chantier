package com.app.chantier_back.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CompteRenduDTO {
    private Long id;
    private String titre;
    private String description;
    private String filePath;
    private String fileType;
    private Long projetId;
    private String projetNom;
    private Long createdById;
    private String createdByNom;
    private String createdByPrenom;
    private LocalDateTime createdAt;
}