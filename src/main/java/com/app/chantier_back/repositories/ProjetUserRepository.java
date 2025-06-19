package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.ProjetUser;
import com.app.chantier_back.entities.enumeration.ERole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjetUserRepository extends JpaRepository<ProjetUser, Long> {
    List<ProjetUser> findByProjetId(Long projetId);
    List<ProjetUser> findByUserId(Long userId);
    Optional<ProjetUser> findByProjetIdAndUserId(Long projetId, Long userId);
    
    @Query("SELECT pu FROM ProjetUser pu WHERE pu.projet.id = :projetId AND pu.role = :role")
    List<ProjetUser> findByProjetIdAndRole(@Param("projetId") Long projetId, @Param("role") ERole role);
    
    boolean existsByProjetIdAndUserIdAndRole(Long projetId, Long userId, ERole role);
} 