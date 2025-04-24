package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.dto.TacheDTO;

import java.util.List;

public interface TacheService {

     List<TacheDTO> getAllTaches();
    TacheDTO getTacheById(Long id);
     TacheDTO createTache(TacheDTO tacheDTO);
     TacheDTO updateTache(Long id, TacheDTO tacheDTO);
    void deleteTache(Long id);
    List<TacheDTO> getTachesByProjectId(Long projectId);

}
