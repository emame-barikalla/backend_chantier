package com.app.chantier_back.controllers;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.services.interfaces.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {
    private final DocumentService documentService;

    @PostMapping("/upload/{projetId}")
    public ResponseEntity<Document> uploadDocument(
            @PathVariable Long projetId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("type") DocumentType type) {
        try {
            Document document = documentService.uploadDocument(projetId, file, titre, description, type);
            return new ResponseEntity<>(document, HttpStatus.CREATED);
        } catch (IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<Document>> getDocumentsByProjetId(@PathVariable Long projetId) {
        List<Document> documents = documentService.getDocumentsByProjetId(projetId);
        return new ResponseEntity<>(documents, HttpStatus.OK);
    }
}
