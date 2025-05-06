package com.app.chantier_back.services;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.DocumentRepository;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.services.interfaces.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final ProjetRepository projetRepository;

    @Override
    public Document uploadDocument(Long projetId, MultipartFile file, String titre, String description, DocumentType type) throws IOException {
        var projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projetId));

        Document document = new Document();
        document.setTitre(titre);
        document.setDescription(description);
        document.setDate(LocalDate.now());
        document.setData(file.getBytes());
        document.setType(type);
        document.setProjet(projet);

        return documentRepository.save(document);
    }

    @Override
    public List<Document> getDocumentsByProjetId(Long projetId) {
        return documentRepository.findByProjetId(projetId);
    }
}