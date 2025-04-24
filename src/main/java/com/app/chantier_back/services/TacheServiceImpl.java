package com.app.chantier_back.services;

import com.app.chantier_back.dto.TacheDTO;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.Tache;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.repositories.TacheRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.interfaces.TacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TacheServiceImpl implements TacheService {
    private final TacheRepository tacheRepository;
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    // Implement the methods from tacheService interface here

    @Override
    public List<TacheDTO> getAllTaches() {
        return tacheRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TacheDTO getTacheById(Long id) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return convertToDTO(tache);
    }

    @Override
    public TacheDTO createTache(TacheDTO tacheDTO) {
        Tache tache = convertToEntity(tacheDTO);
        Tache savedTache = tacheRepository.save(tache);
        return convertToDTO(savedTache);
    }

    @Override
    public TacheDTO updateTache(Long id, TacheDTO tacheDTO) {
        Tache existingTache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        existingTache.setDescription(tacheDTO.getDescription());
        existingTache.setStatut(tacheDTO.getStatut());
        existingTache.setDate(tacheDTO.getDate());

        // Update project association
        if (tacheDTO.getProjetId() != null) {
            Projet project = projetRepository.findById(tacheDTO.getProjetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + tacheDTO.getProjetId()));
            existingTache.setProjet(project);
        } else {
            existingTache.setProjet(null);
        }
        // Update assignee association
        if (tacheDTO.getAssigneeId() != null) {
            User assignee = userRepository.findById(tacheDTO.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + tacheDTO.getAssigneeId()));
            existingTache.setAssignee(assignee);
        } else {
            existingTache.setAssignee(null);
        }
        Tache updatedTache = tacheRepository.save(existingTache);
        return convertToDTO(updatedTache);
    }


    @Override
    public void deleteTache(Long id) {
        if (!tacheRepository.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        tacheRepository.deleteById(id);
    }

    @Override
    public List<TacheDTO> getTachesByProjectId(Long projectId) {
        return tacheRepository.findByProjetId(projectId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    private TacheDTO convertToDTO(Tache tache) {
        TacheDTO tacheDTO = new TacheDTO();
        tacheDTO.setId(tache.getId());
        tacheDTO.setDescription(tache.getDescription());
        tacheDTO.setStatut(tache.getStatut());
        tacheDTO.setDate(tache.getDate());

        if (tache.getProjet() != null) {
            tacheDTO.setProjetId(tache.getProjet().getId());
        }
        if (tache.getAssignee() != null) {
            tacheDTO.setAssigneeId(tache.getAssignee().getId());
        }
        return tacheDTO;
    }
    private Tache convertToEntity(TacheDTO dto) {
        Tache tache = new Tache();
        tache.setId(dto.getId());
        tache.setDescription(dto.getDescription());
        tache.setStatut(dto.getStatut());
        tache.setDate(dto.getDate());

        if (dto.getProjetId() != null) {
            Projet project = projetRepository.findById(dto.getProjetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + dto.getProjetId()));
            tache.setProjet(project);
        }

        if (dto.getAssigneeId() != null) {
            User assignee = userRepository.findById(dto.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getAssigneeId()));
            tache.setAssignee(assignee);
        }

        return tache;
    }

}
