package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.Statut;
import com.app.chantier_back.entities.Tache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByProjetId(Long projetId);
    List<Tache> findByAssigneeId(Long assigneeId);



}
