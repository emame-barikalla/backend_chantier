package com.app.chantier_back.controllers;


import com.app.chantier_back.dto.TacheDTO;
import com.app.chantier_back.services.interfaces.TacheService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;


    @GetMapping("/all")
    public ResponseEntity<List<TacheDTO>> getAllTaches() {
        List<TacheDTO> taches = tacheService.getAllTaches();
        return new ResponseEntity<>(taches, HttpStatus.OK);
    }


    @GetMapping("/{id}")
    public ResponseEntity<TacheDTO> getTacheById(@PathVariable Long id) {
        TacheDTO tache = tacheService.getTacheById(id);
        return new ResponseEntity<>(tache, HttpStatus.OK);
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<List<TacheDTO>> getTachesByProjectId(@PathVariable Long projectId) {
        List<TacheDTO> taches = tacheService.getTachesByProjectId(projectId);
        return new ResponseEntity<>(taches, HttpStatus.OK);
    }


    @PostMapping("/creer")
    public ResponseEntity<TacheDTO> createTache(@Valid @RequestBody TacheDTO tacheDTO) {
        TacheDTO createdTache = tacheService.createTache(tacheDTO);
        return new ResponseEntity<>(createdTache, HttpStatus.CREATED);
    }

    @PutMapping("update/{id}")
    public ResponseEntity<TacheDTO> updateTache(@PathVariable Long id, @Valid @RequestBody TacheDTO tacheDTO) {
        TacheDTO updatedTache = tacheService.updateTache(id, tacheDTO);
        return new ResponseEntity<>(updatedTache, HttpStatus.OK);
    }

//    @PutMapping("/{id}/affecter/{assigneeId}")
//    public ResponseEntity<TacheDTO> affecterTache(@PathVariable Long id, @PathVariable Long assigneeId) {
//        TacheDTO tache = tacheService.affecterTache(id, assigneeId);
//        return new ResponseEntity<>(tache, HttpStatus.OK);
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTache(@PathVariable Long id) {
        tacheService.deleteTache(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

}

