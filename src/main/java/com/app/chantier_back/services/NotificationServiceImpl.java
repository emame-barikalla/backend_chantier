package com.app.chantier_back.services;


import com.app.chantier_back.dto.NotificationDTO;
import com.app.chantier_back.entities.Notification;
import com.app.chantier_back.entities.Projet;
import com.app.chantier_back.entities.Tache;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.NotificationRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.interfaces.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public void sendProjectNotification(Projet projet, String action, List<Long> userIds) {
        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

            Notification notification = new Notification();
            notification.setMessage("Projet " + projet.getNom() + " a eté " + action);
            notification.setType("PROJECT_" + action.toUpperCase());
            notification.setUser(user);
            notification.setProjet(projet);

            Notification savedNotification = notificationRepository.save(notification);

            NotificationDTO notificationDTO = convertToDTO(savedNotification);
            messagingTemplate.convertAndSendToUser(
                    user.getId().toString(),
                    "/queue/user/" + user.getId() + "/notifications",
                    notificationDTO
            );
        }
    }

    @Override
    public void sendUserAssignmentNotification(User user, Projet projet, String role) {
        Notification notification = new Notification();
        notification.setMessage("Vous avez été assigné au projet " + projet.getNom() + " en tant que " + role);
        notification.setType("USER_ASSIGNMENT");
        notification.setUser(user);
        notification.setProjet(projet);

        Notification savedNotification = notificationRepository.save(notification);

        NotificationDTO notificationDTO = convertToDTO(savedNotification);
        messagingTemplate.convertAndSendToUser(
                user.getId().toString(),
                "/queue/user/" + user.getId() + "/notifications",
                notificationDTO
        );
    }

  @Override
  public void sendTaskAssignmentNotification(User user, Tache tache) {
      Notification notification = new Notification();
      notification.setMessage("Vous avez été assigné à la tâche \"" + tache.getDescription() + "\" dans le projet " +
                            (tache.getProjet() != null ? tache.getProjet().getNom() : ""));
      notification.setType("TASK_ASSIGNMENT");
      notification.setUser(user);

      if (tache.getProjet() != null) {
          notification.setProjet(tache.getProjet());
      }

      Notification savedNotification = notificationRepository.save(notification);

      NotificationDTO notificationDTO = convertToDTO(savedNotification);
      messagingTemplate.convertAndSendToUser(
              user.getId().toString(),
              "/queue/user/" + user.getId() + "/notifications",
              notificationDTO
      );
  }

    @Override
    public List<NotificationDTO> getUserNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllAsRead(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    public int getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        return notificationRepository.countByUserAndIsRead(user, false);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setUserId(notification.getUser().getId());

        if (notification.getProjet() != null) {
            dto.setProjetId(notification.getProjet().getId());
            dto.setProjetNom(notification.getProjet().getNom());
        }

        return dto;
    }
}
