package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.DocumentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentCommentRepository extends JpaRepository<DocumentComment, Long> {
    List<DocumentComment> findByDocumentIdOrderByCreatedAtDesc(Long documentId);
} 