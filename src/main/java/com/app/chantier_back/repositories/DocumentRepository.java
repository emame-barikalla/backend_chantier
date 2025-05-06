package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjetId(Long projetId);

}
