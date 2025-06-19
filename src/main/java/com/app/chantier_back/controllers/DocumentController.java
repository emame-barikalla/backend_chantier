package com.app.chantier_back.controllers;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.services.interfaces.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @PostMapping("/upload")
   // @PreAuthorize("hasAnyRole('ADMIN', 'MAITRE_OEUVRE', 'BUREAU_ETUDE', 'CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<Document> uploadDocument(
            @RequestParam("projetId") Long projetId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("type") DocumentType type) throws IOException {

        Document document = documentService.uploadDocument(projetId, file, titre, description, type);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/projet/{projetId}")
    public ResponseEntity<List<Document>> getDocumentsByProjetId(@PathVariable Long projetId) {
        List<Document> documents = documentService.getDocumentsByProjetId(projetId);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        Document document = documentService.getDocumentById(id);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        return documentService.prepareDocumentForDownload(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MAITRE_OEUVRE')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<Resource> viewDocument(@PathVariable Long id) {
        return documentService.prepareDocumentForViewing(id);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentService.getAllDocuments();
        return ResponseEntity.ok(documents);
    }
}