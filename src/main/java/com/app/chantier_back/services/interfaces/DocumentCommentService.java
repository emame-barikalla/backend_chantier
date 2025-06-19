package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.entities.DocumentComment;
import java.util.List;

public interface DocumentCommentService {
    List<DocumentComment> getDocumentComments(Long documentId);
    DocumentComment addComment(Long documentId, String comment);
    DocumentComment updateComment(Long commentId, String comment);
    void deleteComment(Long commentId);
} 