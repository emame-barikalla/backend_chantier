package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.entities.DocumentChecklist;
import com.app.chantier_back.entities.ChecklistItem;
import java.util.List;

public interface DocumentChecklistService {
    DocumentChecklist getDocumentChecklist(Long documentId);
    DocumentChecklist createChecklist(Long documentId, List<String> itemDescriptions);
    ChecklistItem addChecklistItem(Long documentId, String description);
    ChecklistItem updateChecklistItem(Long itemId, boolean isCompleted);
    void deleteChecklistItem(Long itemId);
} 