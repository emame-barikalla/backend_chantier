package com.app.chantier_back.entities;


import jakarta.persistence.*;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;

import java.util.Set;

@Entity
@Table(name = "permissions")
@Data
public class Permission implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "READ_USER", "CREATE_USER"

    @ManyToMany(mappedBy = "permissions")
    private Set<Role> roles;

    @Override
    public String getAuthority() {
        return name;
    }
}