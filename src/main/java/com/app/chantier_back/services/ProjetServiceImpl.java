package com.app.chantier_back.services;

import com.app.chantier_back.dto.ProjetDTO;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.Status;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.services.interfaces.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjetServiceImpl implements ProjetService {
    private final ProjetRepository projetRepository;

    @Override
    public List<ProjetDTO> getAllProjets() {
        return projetRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProjetDTO getProjetById(Long id) {
        Projet project = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return convertToDTO(project);
    }

    @Override
    public ProjetDTO createProjet(ProjetDTO projetDTO) {
        Projet project = convertToEntity(projetDTO);
        project.setStatus(Status.PLANIFIE);
        Projet savedProject = projetRepository.save(project);
        return convertToDTO(savedProject);
    }

    @Override
    public ProjetDTO updateProjet(Long id, ProjetDTO projetDTO) {
        Projet existingProject = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        existingProject.setNom(projetDTO.getNom());
        existingProject.setDateDebut(projetDTO.getDateDebut());
        existingProject.setDateFin(projetDTO.getDateFin());
        existingProject.setBudget(projetDTO.getBudget());
        existingProject.setStatus(projetDTO.getStatus());


        Projet updatedProject = projetRepository.save(existingProject);
        return convertToDTO(updatedProject);
    }

    @Override
    public void deleteProjet(Long id) {
        if (!projetRepository.existsById(id)) {
            throw new ResourceNotFoundException("Project not found with id: " + id);
        }
        projetRepository.deleteById(id);

    }

    @Override
    public List<ProjetDTO> getProjectsByStatus(Status status) {
        return projetRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private ProjetDTO convertToDTO(Projet projet) {
        ProjetDTO projetDTO = new ProjetDTO();
        projetDTO.setId(projet.getId());
        projetDTO.setNom(projet.getNom());
        projetDTO.setDateDebut(projet.getDateDebut());
        projetDTO.setDateFin(projet.getDateFin());
        projetDTO.setBudget(projet.getBudget());
        projetDTO.setStatus(projet.getStatus());


        if (projet.getTaches() != null) {
            projetDTO.setTacheIds(projet.getTaches().stream()
                    .map(tache -> tache.getId())
                    .collect(Collectors.toList()));
        }
        return projetDTO;

    }

    private Projet convertToEntity(ProjetDTO projetDTO) {
        Projet projet = new Projet();
        projet.setNom(projetDTO.getNom());
        projet.setDateDebut(projetDTO.getDateDebut());
        projet.setDateFin(projetDTO.getDateFin());
        projet.setBudget(projetDTO.getBudget());
        projet.setStatus(projetDTO.getStatus());

        return projet;
    }
}
