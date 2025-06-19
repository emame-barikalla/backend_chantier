package com.app.chantier_back.services;

import com.app.chantier_back.dto.CompteRenduDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface ICompteRenduService {

    CompteRenduDTO saveCompteRendu(Long projetId, Long userId, String titre, String description,
                                String fileType, MultipartFile file) throws IOException;

    List<CompteRenduDTO> getAllByProjet(Long projetId);

    List<CompteRenduDTO> getAllByProjetAndType(Long projetId, String fileType);

    CompteRenduDTO getById(Long id);

    void deleteCompteRendu(Long id) throws IOException;
}