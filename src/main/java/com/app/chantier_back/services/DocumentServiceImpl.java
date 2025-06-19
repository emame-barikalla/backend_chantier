package com.app.chantier_back.services;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.Role;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.entities.enumeration.DocumentType;
import com.app.chantier_back.entities.enumeration.ERole;
import com.app.chantier_back.exceptions.AccessDeniedException;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.DocumentRepository;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.security.DocumentSecurityService;
import com.app.chantier_back.security.RoleUtils;
import com.app.chantier_back.services.interfaces.DocumentService;
import com.app.chantier_back.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class DocumentServiceImpl implements DocumentService {
    private final DocumentRepository documentRepository;
    private final ProjetRepository projetRepository;
    private final DocumentSecurityService documentSecurityService;
    private final UserService userService;

    @Override
    public Document uploadDocument(Long projetId, MultipartFile file, String titre, String description, DocumentType type) throws IOException {
        var projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projetId));

        User currentUser = userService.getCurrentUser();
        if (!userService.isUserInProject(currentUser.getId(), projetId)) {
            throw new AccessDeniedException("You don't have access to this project");
        }

        if (!documentSecurityService.canUploadDocumentType(type)) {
            throw new AccessDeniedException("You don't have permission to upload this document type");
        }

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

        User currentUser = userService.getCurrentUser();
        if (!userService.isUserInProject(currentUser.getId(), projetId)) {
            throw new AccessDeniedException("You don't have access to this project");
        }

        List<Document> documents = documentRepository.findByProjetId(projetId);
        return documents.stream()
                .filter(documentSecurityService::hasAccessToDocument)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Document getDocumentById(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        if (!documentSecurityService.hasAccessToDocument(document)) {
            throw new AccessDeniedException("You don't have permission to access this document");
        }

        return document;
    }

    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> prepareDocumentForDownload(Long id) {
        Document document = getDocumentById(id);

        Resource resource = new ByteArrayResource(document.getData());
        String filename = document.getFileName() != null ? document.getFileName() : document.getTitre();
        String extension = filename.contains(".") ? filename.substring(filename.lastIndexOf(".") + 1).toLowerCase() : "";
        String mimeType = switch (extension) {
            case "pdf" -> "application/pdf";
            case "odt" -> "application/vnd.oasis.opendocument.text";
            case "ods" -> "application/vnd.oasis.opendocument.spreadsheet";
            default -> "application/octet-stream";
        };

        if (!filename.endsWith("." + extension)) {
            filename += "." + extension;
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeType))
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(resource);
    }


    @Override
    @Transactional(readOnly = true)
    public ResponseEntity<Resource> prepareDocumentForViewing(Long id) {
        Document document = getDocumentById(id);

        Resource resource = new ByteArrayResource(document.getData());
        String contentType = document.getContentType() != null ? document.getContentType() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    // Inside DocumentServiceImpl.java, replace the existing methods with calls to RoleUtils
    // And remove the duplicate methods

    @Override
    public void deleteDocument(Long id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + id));

        User currentUser = userService.getCurrentUser();
        if (!RoleUtils.hasAnyRole(currentUser.getRoles(), ERole.ROLE_ADMIN, ERole.ROLE_MAITRE_OEUVRE)) {
            throw new AccessDeniedException("You don't have permission to delete documents");
        }

        if (!userService.isUserInProject(currentUser.getId(), document.getProjet().getId())) {
            throw new AccessDeniedException("You don't have access to this project");
        }

        documentRepository.deleteById(id);
    }

    @Override
    public List<Document> getAllDocuments() {
        User currentUser = userService.getCurrentUser();
        List<Document> allDocuments;

        if (RoleUtils.hasRole(currentUser.getRoles(), ERole.ROLE_ADMIN)) {
            allDocuments = documentRepository.findAll();
        } else {
            allDocuments = documentRepository.findByProjetInUserProjects(currentUser.getId());
        }

        return allDocuments.stream()
                .filter(documentSecurityService::hasAccessToDocument)
                .collect(Collectors.toList());
    }
}
