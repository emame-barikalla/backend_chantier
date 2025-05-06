package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.enumeration.Category;
import com.app.chantier_back.entities.enumeration.StatusProjet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet, Long> {
    List<Projet> findByStatus(StatusProjet status);
    List<Projet> findByDateDebutBetween(LocalDate startDate, LocalDate endDate);
    List<Projet> findByIsArchived(boolean isArchived);

    List<Projet>findByCategory(Category category);




}
