package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.dto.NotificationDTO;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.Tache;
import com.app.chantier_back.entities.User;

import java.util.List;

public interface NotificationService {
    void sendProjectNotification(Projet projet, String action, List<Long> userIds);
    void sendUserAssignmentNotification(User user, Projet projet, String role);
    void sendTaskAssignmentNotification(User user, Tache tache);
    List<NotificationDTO> getUserNotifications(Long userId);
    List<NotificationDTO> getUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    int getUnreadCount(Long userId);
}