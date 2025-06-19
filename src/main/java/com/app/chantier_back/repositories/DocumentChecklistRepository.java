package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.DocumentChecklist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DocumentChecklistRepository extends JpaRepository<DocumentChecklist, Long> {
    Optional<DocumentChecklist> findByDocumentId(Long documentId);
} 