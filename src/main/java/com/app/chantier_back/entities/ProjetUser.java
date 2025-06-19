package com.app.chantier_back.entities;

import com.app.chantier_back.entities.enumeration.ERole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "projet_users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjetUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "projet_id")
    private Projet projet;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ERole role;

    @Column(nullable = false)
    private boolean isActive = true;
} 