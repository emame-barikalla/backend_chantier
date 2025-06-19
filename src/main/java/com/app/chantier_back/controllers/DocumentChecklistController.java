package com.app.chantier_back.controllers;

import com.app.chantier_back.entities.DocumentChecklist;
import com.app.chantier_back.entities.ChecklistItem;
import com.app.chantier_back.services.interfaces.DocumentChecklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentChecklistController {

    @Autowired
    private DocumentChecklistService checklistService;

    @GetMapping("/{documentId}/checklist")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<DocumentChecklist> getDocumentChecklist(@PathVariable Long documentId) {
        return ResponseEntity.ok(checklistService.getDocumentChecklist(documentId));
    }

    @PostMapping("/{documentId}/checklist")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<DocumentChecklist> createChecklist(
            @PathVariable Long documentId,
            @RequestBody List<String> itemDescriptions) {
        return ResponseEntity.ok(checklistService.createChecklist(documentId, itemDescriptions));
    }

    @PostMapping("/{documentId}/checklist/items")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<ChecklistItem> addChecklistItem(
            @PathVariable Long documentId,
            @RequestBody String description) {
        return ResponseEntity.ok(checklistService.addChecklistItem(documentId, description));
    }

    @PutMapping("/checklist/items/{itemId}")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<ChecklistItem> updateChecklistItem(
            @PathVariable Long itemId,
            @RequestBody boolean isCompleted) {
        return ResponseEntity.ok(checklistService.updateChecklistItem(itemId, isCompleted));
    }

    @DeleteMapping("/checklist/items/{itemId}")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<Void> deleteChecklistItem(@PathVariable Long itemId) {
        checklistService.deleteChecklistItem(itemId);
        return ResponseEntity.ok().build();
    }
} 