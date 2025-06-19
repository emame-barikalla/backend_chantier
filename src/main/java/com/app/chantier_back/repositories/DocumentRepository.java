package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByProjetId(Long projetId);


    @Query("SELECT d FROM Document d WHERE d.projet.id IN " +
            "(SELECT pu.projet.id FROM ProjetUser pu WHERE pu.user.id = :userId)")

    List<Document> findByProjetInUserProjects(@Param("userId") Long userId);

}


