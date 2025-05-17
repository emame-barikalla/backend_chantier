package com.app.chantier_back.services;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.DocumentRepository;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.services.interfaces.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
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

        document.setContentType(file.getContentType());
        document.setFileName(file.getOriginalFilename());
        document.setFileSize(file.getSize());


        return documentRepository.save(document);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Document> getDocumentsByProjetId(Long projetId) {
        if (!projetRepository.existsById(projetId)) {
            throw new ResourceNotFoundException("Project not found with id: " + projetId);
        }
        return documentRepository.findByProjetId(projetId);
    }

    @Override
    @Transactional(readOnly = true)
    public Document getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));
    }

//    @Override
//    @Transactional(readOnly = true)
//    public Resource downloadDocument(Long id) {
//        Document document = getDocumentById(id);
//        return new ByteArrayResource(document.getData());
//    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> prepareDocumentForDownload(Long id) {
        Document document = getDocumentById(id);
        Resource resource = new ByteArrayResource(document.getData());

        // Use stored filename or fall back to title
        String filename = document.getFileName() != null
                ? document.getFileName()
                : document.getTitre();

        // Extract file extension from filename
        String extension = "";
        if (filename.contains(".")) {
            extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        }

        // Validate and determine MIME type
        String mimeType;
        switch (extension) {
            case "pdf":
                mimeType = "application/pdf";
                break;
            case "odt":
                mimeType = "application/vnd.oasis.opendocument.text";
                break;
            case "ods":
                mimeType = "application/vnd.oasis.opendocument.spreadsheet";
                break;
            default:
                throw new IllegalArgumentException("Unsupported file type: " + extension);
        }

        // Ensure the filename has the correct extension
        if (!filename.endsWith("." + extension)) {
            filename += "." + extension;
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }

    @Override
    public void deleteDocument(Long id) {
        if (!documentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Document not found with id: " + id);
        }
        documentRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> prepareDocumentForViewing(Long id) {
        Document document = getDocumentById(id);
        Resource resource = new ByteArrayResource(document.getData());

        // Get the content type from the document or use a default
        String contentType = document.getContentType() != null
                ? document.getContentType()
                : "application/octet-stream";

        // For viewing, we don't set Content-Disposition to "attachment"
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}