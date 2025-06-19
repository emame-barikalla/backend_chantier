package com.app.chantier_back.services;
import com.app.chantier_back.dto.CompteRenduDTO;
import com.app.chantier_back.entities.CompteRendu;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.CompteRenduRepository;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.ICompteRenduService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompteRenduService implements ICompteRenduService {

    private final CompteRenduRepository compteRenduRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final String UPLOAD_DIR = "uploads/compte_rendus";

    @Override
    @Transactional
    public CompteRenduDTO saveCompteRendu(Long projetId, Long userId, String titre, String description,
                                          String fileType, MultipartFile file) throws IOException {

        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique file name
        String uniqueFileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFileName);

        // Save file to disk
        Files.copy(file.getInputStream(), filePath);

        // Create and save CompteRendu entity
        CompteRendu compteRendu = CompteRendu.builder()
                .titre(titre)
                .description(description)
                .filePath(UPLOAD_DIR + "/" + uniqueFileName)
                .fileType(fileType)
                .projet(projet)
                .createdBy(user)
                .build();

        CompteRendu saved = compteRenduRepository.save(compteRendu);
        return convertToDTO(saved);
    }

    @Override
    public List<CompteRenduDTO> getAllByProjet(Long projetId) {
        return compteRenduRepository.findByProjetId(projetId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CompteRenduDTO> getAllByProjetAndType(Long projetId, String fileType) {
        return compteRenduRepository.findByProjetIdAndFileType(projetId, fileType).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CompteRenduDTO getById(Long id) {
        CompteRendu compteRendu = compteRenduRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte rendu not found"));
        return convertToDTO(compteRendu);
    }

    @Override
    @Transactional
    public void deleteCompteRendu(Long id) throws IOException {
        CompteRendu compteRendu = compteRenduRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compte rendu not found"));

        // Delete file from disk
        Path filePath = Paths.get(compteRendu.getFilePath());
        Files.deleteIfExists(filePath);

        // Delete entity
        compteRenduRepository.delete(compteRendu);
    }

    private CompteRenduDTO convertToDTO(CompteRendu compteRendu) {
        CompteRenduDTO dto = new CompteRenduDTO();
        dto.setId(compteRendu.getId());
        dto.setTitre(compteRendu.getTitre());
        dto.setDescription(compteRendu.getDescription());
        dto.setFilePath(compteRendu.getFilePath());
        dto.setFileType(compteRendu.getFileType());
        dto.setProjetId(compteRendu.getProjet().getId());
        dto.setProjetNom(compteRendu.getProjet().getNom());
        dto.setCreatedById(compteRendu.getCreatedBy().getId());
        dto.setCreatedByNom(compteRendu.getCreatedBy().getNom());
        dto.setCreatedByPrenom(compteRendu.getCreatedBy().getPrenom());
        dto.setCreatedAt(compteRendu.getCreatedAt());
        return dto;
    }
}