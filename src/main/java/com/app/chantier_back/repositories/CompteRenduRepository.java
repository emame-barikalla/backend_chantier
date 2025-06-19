package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.CompteRendu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompteRenduRepository extends JpaRepository<CompteRendu, Long> {
    List<CompteRendu> findByProjetId(Long projetId);
    List<CompteRendu> findByProjetIdAndFileType(Long projetId, String fileType);
}