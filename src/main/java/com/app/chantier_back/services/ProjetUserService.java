package com.app.chantier_back.services;

import com.app.chantier_back.dto.ProjetUserDTO;
import com.app.chantier_back.entities.ProjetUser;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.enumeration.ERole;
import com.app.chantier_back.repositories.ProjetUserRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.services.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjetUserService {
    private final ProjetUserRepository projetUserRepository;
    private final UserRepository userRepository;
    private final ProjetRepository projetRepository;
    private final NotificationService notificationService;

    @Transactional
    public ProjetUserDTO assignUserToProject(Long projetId, Long userId, ERole role) {
        Projet projet = projetRepository.findById(projetId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if user already has this role in the project
        if (projetUserRepository.existsByProjetIdAndUserIdAndRole(projetId, userId, role)) {
            throw new IllegalStateException("User already has this role in the project");
        }

        ProjetUser projetUser = ProjetUser.builder()
                .projet(projet)
                .user(user)
                .role(role)
                .isActive(true)
                .build();

        ProjetUser saved = projetUserRepository.save(projetUser);

        // Send notification to the assigned user
        notificationService.sendUserAssignmentNotification(user, projet, role.name());

        return convertToDTO(saved);
    }

    @Transactional
    public void removeUserFromProject(Long projetId, Long userId, ERole role) {
        ProjetUser projetUser = projetUserRepository.findByProjetIdAndUserId(projetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found in project"));
        
        if (projetUser.getRole() != role) {
            throw new IllegalStateException("User does not have the specified role in this project");
        }

        projetUser.setActive(false);
        projetUserRepository.save(projetUser);
    }

    public List<ProjetUserDTO> getProjectUsers(Long projetId) {
        return projetUserRepository.findByProjetId(projetId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProjetUserDTO> getProjectUsersByRole(Long projetId, ERole role) {
        return projetUserRepository.findByProjetIdAndRole(projetId, role).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjetUserDTO activateUserInProject(Long projetId, Long userId) {
        ProjetUser projetUser = projetUserRepository.findByProjetIdAndUserId(projetId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found in project"));
        
        projetUser.setActive(true);
        ProjetUser saved = projetUserRepository.save(projetUser);
        return convertToDTO(saved);
    }

    private ProjetUserDTO convertToDTO(ProjetUser projetUser) {
        ProjetUserDTO dto = new ProjetUserDTO();
        dto.setId(projetUser.getId());
        dto.setProjetId(projetUser.getProjet().getId());
        dto.setUserId(projetUser.getUser().getId());
        dto.setRole(projetUser.getRole());
        dto.setActive(projetUser.isActive());
        
        // Set user details
        dto.setUserNom(projetUser.getUser().getNom());
        dto.setUserPrenom(projetUser.getUser().getPrenom());
        dto.setUserEmail(projetUser.getUser().getEmail());
        
        return dto;
    }
} 