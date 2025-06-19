package com.app.chantier_back.services;

import com.app.chantier_back.dto.ProjetDTO;
import com.app.chantier_back.dto.ProjetUserDTO;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.ProjetUser;
import com.app.chantier_back.entities.enumeration.Category;
import com.app.chantier_back.entities.enumeration.StatusProjet;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.ProjetRepository;
import com.app.chantier_back.repositories.ProjetUserRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.interfaces.NotificationService;
import com.app.chantier_back.services.interfaces.ProjetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjetServiceImpl implements ProjetService {
    private final ProjetRepository projetRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final ProjetUserRepository projetUserRepository;

    // Récupérer tous les projets except les archivés
    @Override
    public List<ProjetDTO> getAllProjets() {

        return projetRepository.findByIsArchived(false).stream()
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
        project.setStatus(StatusProjet.PLANIFIE);
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
        existingProject.setCategory(projetDTO.getCategory());


        Projet updatedProject = projetRepository.save(existingProject);


        // Fetch active users assigned to the project
        List<Long> userIds = projetUserRepository.findByProjetId(id)
                .stream()
                .filter(ProjetUser::isActive) // Only active users
                .map(projetUser -> projetUser.getUser().getId()) // Extract user IDs
                .collect(Collectors.toList());

        // Validate user IDs before sending notifications
//        if (userIds.isEmpty()) {
//            throw new ResourceNotFoundException("No users assigned to project with id: " + id);
//        }


        // Notify users about the project update only if there are active users
        if (!userIds.isEmpty()) {
            notificationService.sendProjectNotification(updatedProject, "modifiée", userIds);
        }

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
    public List<ProjetDTO> getProjectsByStatus(StatusProjet status) {
        return projetRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // archiver un projet
    @Override
    public void archiveProject(Long id) {
        Projet projet = projetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        projet.setArchived(true);
        projetRepository.save(projet);
    }

   // voir la liste des projets archivés
    @Override
    public List<Projet> getArchivedProjects() {
        return projetRepository.findByIsArchived(true);
    }

    @Override
    public List<ProjetDTO> getProjectsByCategory(Category category) {
        return projetRepository.findByCategory(category).stream()
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
        projetDTO.setCategory(projet.getCategory());


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
        projet.setCategory(projetDTO.getCategory());

        return projet;
    }
}
