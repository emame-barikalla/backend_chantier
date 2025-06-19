package com.app.chantier_back.controllers;

import com.app.chantier_back.entities.DocumentComment;
import com.app.chantier_back.services.interfaces.DocumentCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DocumentCommentController {

    @Autowired
    private DocumentCommentService commentService;

    @GetMapping("/{documentId}/comments")
    public ResponseEntity<List<DocumentComment>> getDocumentComments(@PathVariable Long documentId) {
        return ResponseEntity.ok(commentService.getDocumentComments(documentId));
    }

    @PostMapping("/{documentId}/comments")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<DocumentComment> addComment(
            @PathVariable Long documentId,
            @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(documentId, request.getComment()));
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<DocumentComment> updateComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request.getComment()));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('CONTROLEUR_TECHNIQUE')")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.ok().build();
    }
}

class CommentRequest {
    private String comment;

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
} 