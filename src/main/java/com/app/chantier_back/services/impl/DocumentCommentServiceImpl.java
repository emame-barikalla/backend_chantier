package com.app.chantier_back.services.impl;

import com.app.chantier_back.entities.Document;
import com.app.chantier_back.entities.DocumentComment;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.repositories.DocumentCommentRepository;
import com.app.chantier_back.repositories.DocumentRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.interfaces.DocumentCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DocumentCommentServiceImpl implements DocumentCommentService {

    @Autowired
    private DocumentCommentRepository commentRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<DocumentComment> getDocumentComments(Long documentId) {
        return commentRepository.findByDocumentIdOrderByCreatedAtDesc(documentId);
    }

    @Override
    @Transactional
    public DocumentComment addComment(Long documentId, String comment) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        DocumentComment documentComment = new DocumentComment();
        documentComment.setDocument(document);
        documentComment.setUser(user);
        documentComment.setComment(comment);

        return commentRepository.save(documentComment);
    }

    @Override
    @Transactional
    public DocumentComment updateComment(Long commentId, String comment) {
        DocumentComment documentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!documentComment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to update this comment");
        }

        documentComment.setComment(comment);
        return commentRepository.save(documentComment);
    }

    @Override
    @Transactional
    public void deleteComment(Long commentId) {
        DocumentComment documentComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!documentComment.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Not authorized to delete this comment");
        }

        commentRepository.delete(documentComment);
    }
} 