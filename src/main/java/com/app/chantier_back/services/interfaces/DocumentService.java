package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.enumeration.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DocumentService {
    Document uploadDocument(Long projetId, MultipartFile file, String titre, String description, DocumentType type) throws IOException;
    List<Document> getDocumentsByProjetId(Long projetId);
}

