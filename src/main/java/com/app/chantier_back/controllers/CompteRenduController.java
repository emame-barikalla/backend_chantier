package com.app.chantier_back.controllers;

import com.app.chantier_back.dto.CompteRenduDTO;
import com.app.chantier_back.services.ICompteRenduService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/compte-rendus")
@RequiredArgsConstructor
public class CompteRenduController {

    private final ICompteRenduService compteRenduService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ENTREPRISE') or hasRole('MAITRE_OEUVRE')")
    public ResponseEntity<CompteRenduDTO> createCompteRendu(
            @RequestParam("projetId") Long projetId,
            @RequestParam("userId") Long userId,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("fileType") String fileType,
            @RequestParam("file") MultipartFile file) throws IOException {

        CompteRenduDTO result = compteRenduService.saveCompteRendu(
                projetId, userId, titre, description, fileType, file);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/projet/{projetId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MAITRE_OUVRAGE') or hasRole('ENTREPRISE') or hasRole('MAITRE_OEUVRE')")
    public ResponseEntity<List<CompteRenduDTO>> getByProjet(@PathVariable Long projetId) {
        List<CompteRenduDTO> compteRendus = compteRenduService.getAllByProjet(projetId);
        return ResponseEntity.ok(compteRendus);
    }

    @GetMapping("/projet/{projetId}/type/{fileType}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MAITRE_OUVRAGE') or hasRole('ENTREPRISE') or hasRole('MAITRE_OEUVRE')")
    public ResponseEntity<List<CompteRenduDTO>> getByProjetAndType(
            @PathVariable Long projetId,
            @PathVariable String fileType) {

        List<CompteRenduDTO> compteRendus = compteRenduService.getAllByProjetAndType(projetId, fileType);
        return ResponseEntity.ok(compteRendus);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MAITRE_OUVRAGE') or hasRole('ENTREPRISE') or hasRole('MAITRE_OEUVRE')")
    public ResponseEntity<CompteRenduDTO> getById(@PathVariable Long id) {
        CompteRenduDTO compteRendu = compteRenduService.getById(id);
        return ResponseEntity.ok(compteRendu);
    }

    @GetMapping("/file/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MAITRE_OUVRAGE') or hasRole('ENTREPRISE') or hasRole('MAITRE_OEUVRE')")
    public ResponseEntity<Resource> getFile(@PathVariable Long id) throws IOException {
        CompteRenduDTO compteRendu = compteRenduService.getById(id);

        Resource resource;
        Path filePath = Paths.get(compteRendu.getFilePath());

        if (Files.exists(filePath)) {
            // Le fichier existe sur disque
            resource = new UrlResource(filePath.toUri());
        } else {
            // Fallback vers le classpath resource
            String filename = filePath.getFileName().toString();
            resource = new org.springframework.core.io.ClassPathResource("/static/uploads/compte_rendus/" + filename);

            if (!resource.exists()) {
                throw new java.io.FileNotFoundException("Fichier introuvable : " + filename);
            }
        }

        // Déterminer le Content-Type
        String contentType;
        if ("PHOTO".equalsIgnoreCase(compteRendu.getFileType())) {
            contentType = "image/jpeg";
        } else {
            contentType = "video/mp4";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

//    @GetMapping("/file/{id}")
//    @PreAuthorize("hasRole('ADMIN') or hasRole('MAITRE_OUVRAGE') or hasRole('ENTREPRISE') or hasRole('MAITRE_OEUVRE')")
//    public ResponseEntity<Resource> getFile(@PathVariable Long id) throws IOException {
//        CompteRenduDTO compteRendu = compteRenduService.getById(id);
//        Path filePath = Paths.get(compteRendu.getFilePath());
//        Resource resource = new UrlResource(filePath.toUri());
//
//        String contentType;
//        if (compteRendu.getFileType().equals("PHOTO")) {
//            contentType = "image/jpeg";
//        } else {
//            contentType = "video/mp4";
//        }
//
//        return ResponseEntity.ok()
//                .contentType(MediaType.parseMediaType(contentType))
//                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
//                .body(resource);
//    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MAITRE_OEUVRE')")
    public ResponseEntity<Void> deleteCompteRendu(@PathVariable Long id) throws IOException {
        compteRenduService.deleteCompteRendu(id);
        return ResponseEntity.noContent().build();
    }
}