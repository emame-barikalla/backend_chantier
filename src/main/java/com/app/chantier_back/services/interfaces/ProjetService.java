package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.dto.ProjetDTO;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.enumeration.StatusProjet;

import java.util.List;
import com.app.chantier_back.entities.enumeration.Category;
public interface ProjetService {


     List<ProjetDTO> getAllProjets();
     ProjetDTO getProjetById(Long id);
     ProjetDTO createProjet(ProjetDTO projetDTO);
     ProjetDTO updateProjet(Long id, ProjetDTO projetDTO);
     void deleteProjet(Long id);
    List<ProjetDTO> getProjectsByStatus(StatusProjet status);
     void archiveProject(Long id);
     List<Projet> getArchivedProjects();

    List<ProjetDTO> getProjectsByCategory(Category category);
}

