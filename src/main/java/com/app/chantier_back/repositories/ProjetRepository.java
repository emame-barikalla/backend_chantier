package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.Status;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ProjetRepository extends JpaRepository<Projet, Long> {
    List<Projet> findByStatus(Status status);
    List<Projet> findByDateDebutBetween(LocalDate startDate, LocalDate endDate);
}
