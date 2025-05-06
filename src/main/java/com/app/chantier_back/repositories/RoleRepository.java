package com.app.chantier_back.repositories;

import com.app.chantier_back.entities.enumeration.ERole;
import com.app.chantier_back.entities.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(ERole name);
}
