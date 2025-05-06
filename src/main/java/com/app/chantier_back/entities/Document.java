package com.app.chantier_back.entities;

import com.app.chantier_back.entities.enumeration.DocumentType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "document")


@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;
    private String description;
    private LocalDate date;

    @Lob
    private byte[] data;

    @Enumerated(EnumType.STRING)
    private DocumentType type;


    @ManyToOne
    @JoinColumn(name = "projet_id", nullable = false)
    private Projet projet;
}