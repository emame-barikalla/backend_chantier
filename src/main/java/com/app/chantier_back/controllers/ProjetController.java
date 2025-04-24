package com.app.chantier_back.controllers;

import com.app.chantier_back.dto.ProjetDTO;
import com.app.chantier_back.entities.Status;
import com.app.chantier_back.services.interfaces.ProjetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/projets")
public class ProjetController {
    private final ProjetService projetService;

    @GetMapping("/all")
    public ResponseEntity<List<ProjetDTO>> getAllProjects() {
        List<ProjetDTO> projects = projetService.getAllProjets();
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }
    @GetMapping("/{id}")
    public ResponseEntity<ProjetDTO> getProjectById(@PathVariable Long id) {
        ProjetDTO project = projetService.getProjetById(id);
        return new ResponseEntity<>(project, HttpStatus.OK);
    }
    @PostMapping("/creer")
    public ResponseEntity<ProjetDTO> creerProjet(@Valid @RequestBody ProjetDTO projectDTO) {
        ProjetDTO createdProject = projetService.createProjet(projectDTO);
        return new ResponseEntity<>(createdProject, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ProjetDTO> updateProjet(@PathVariable Long id, @Valid @RequestBody ProjetDTO projectDTO) {
        ProjetDTO updatedProject = projetService.updateProjet(id, projectDTO);
        return new ResponseEntity<>(updatedProject, HttpStatus.OK);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projetService.deleteProjet(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ProjetDTO>> getProjectsByStatus(@PathVariable Status status) {
        List<ProjetDTO> projects = projetService.getProjectsByStatus(status);
        return new ResponseEntity<>(projects, HttpStatus.OK);
    }
}
