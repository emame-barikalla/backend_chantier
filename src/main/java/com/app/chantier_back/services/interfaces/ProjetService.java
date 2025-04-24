package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.dto.ProjetDTO;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.Status;

import java.util.List;

public interface ProjetService {


     List<ProjetDTO> getAllProjets();
     ProjetDTO getProjetById(Long id);
     ProjetDTO createProjet(ProjetDTO projetDTO);
     ProjetDTO updateProjet(Long id, ProjetDTO projetDTO);
     void deleteProjet(Long id);
    List<ProjetDTO> getProjectsByStatus(Status status);
}

