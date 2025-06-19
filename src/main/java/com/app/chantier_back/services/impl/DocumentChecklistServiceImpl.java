package com.app.chantier_back.services.impl;

import com.app.chantier_back.entities.*;
import com.app.chantier_back.repositories.*;
import com.app.chantier_back.services.interfaces.DocumentChecklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentChecklistServiceImpl implements DocumentChecklistService {

    @Autowired
    private DocumentChecklistRepository checklistRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public DocumentChecklist getDocumentChecklist(Long documentId) {
        return checklistRepository.findByDocumentId(documentId)
                .orElseGet(() -> createChecklist(documentId, List.of()));
    }

    @Override
    @Transactional
    public DocumentChecklist createChecklist(Long documentId, List<String> itemDescriptions) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentChecklist checklist = new DocumentChecklist();
        checklist.setDocument(document);
        checklist.setCreatedBy(user);

        List<ChecklistItem> items = itemDescriptions.stream()
                .map(description -> {
                    ChecklistItem item = new ChecklistItem();
                    item.setChecklist(checklist);
                    item.setDescription(description);
                    item.setCompleted(false);
                    return item;
                })
                .collect(Collectors.toList());

        checklist.setItems(items);
        return checklistRepository.save(checklist);
    }

    @Override
    @Transactional
    public ChecklistItem addChecklistItem(Long documentId, String description) {
        DocumentChecklist checklist = getDocumentChecklist(documentId);

        ChecklistItem item = new ChecklistItem();
        item.setChecklist(checklist);
        item.setDescription(description);
        item.setCompleted(false);

        checklist.getItems().add(item);
        checklistRepository.save(checklist);
        return item;
    }

    @Override
    @Transactional
    public ChecklistItem updateChecklistItem(Long itemId, boolean isCompleted) {
        ChecklistItem item = checklistRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"))
                .getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));

        item.setCompleted(isCompleted);
        if (isCompleted) {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            item.setCompletedBy(user);
            item.setCompletedAt(LocalDateTime.now());
        } else {
            item.setCompletedBy(null);
            item.setCompletedAt(null);
        }

        checklistRepository.save(item.getChecklist());
        return item;
    }

    @Override
    @Transactional
    public void deleteChecklistItem(Long itemId) {
        DocumentChecklist checklist = checklistRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist not found"));

        checklist.getItems().removeIf(item -> item.getId().equals(itemId));
        checklistRepository.save(checklist);
    }
} 