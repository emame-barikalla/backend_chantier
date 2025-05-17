package com.app.chantier_back.entities;

import com.app.chantier_back.entities.enumeration.DocumentType;
import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Column(nullable = false)
    private String titre;

    @Column(length = 500)
    private String description;


    private LocalDate date;

    @Lob
    @JsonIgnore // Prevent serializing binary data in REST responses
    private byte[] data;

    private String contentType; // Store the file's MIME type

    private String fileName; // Original file name

    private Long fileSize; // Size in bytes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DocumentType type;

    @ManyToOne
    @JoinColumn(name = "projet_id", nullable = false)
    @JsonIgnore // Prevent circular reference in JSON serialization
    private Projet projet;
}