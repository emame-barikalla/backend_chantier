package com.app.chantier_back.services;


import com.app.chantier_back.dto.PasswordChangeDTO;
import com.app.chantier_back.dto.UserDTO;
import com.app.chantier_back.entities.Role;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.exceptions.InvalidPasswordException;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.ProjetUserRepository;
import com.app.chantier_back.repositories.RoleRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.app.chantier_back.entities.enumeration.ERole;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {


    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;
    private final ProjetUserRepository projetUserRepository;

    @Override


    public User createUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setNom(userDTO.getNom()); // Set the nom field
        user.setPrenom(userDTO.getPrenom()); // Set the prenom field
        user.setTelephone(userDTO.getTelephone()); // Set the telephone field
        user.setAdresse(userDTO.getAdresse()); // Set the adresse field

        Set<Role> roles = new HashSet<>();
        if (userDTO.getRoles() != null) {
            roles = userDTO.getRoles().stream()
                    .map(r -> roleRepository.findById(r.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Role not found")))
                    .collect(Collectors.toSet());
        }
        user.setRoles(roles);

        return userRepository.save(user);
    }

    @Override

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setEmail(userDTO.getEmail());
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        user.setNom(userDTO.getNom()); // Set the nom field
        user.setPrenom(userDTO.getPrenom()); // Set the prenom field
        user.setTelephone(userDTO.getTelephone()); // Set the telephone field
        user.setAdresse(userDTO.getAdresse()); // Set the adresse field


        if (userDTO.getRoles() != null) {
            Set<Role> roles = userDTO.getRoles().stream()
                    .map(r -> roleRepository.findById(r.getId())
                            .orElseThrow(() -> new ResourceNotFoundException("Role not found")))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }
    @Override

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    public List<User> getUsersByRole(ERole roleName) {
        return userRepository.findByRoleName(roleName);
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }


    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }

    @Override
    @Transactional
    public void changePassword(String email, PasswordChangeDTO passwordChangeDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        // Verify current password
        if (!passwordEncoder.matches(passwordChangeDTO.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        // Verify new password and confirmation match
        if (!passwordChangeDTO.getNewPassword().equals(passwordChangeDTO.getConfirmPassword())) {
            throw new InvalidPasswordException("New password and confirmation password do not match");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(passwordChangeDTO.getNewPassword()));
        userRepository.save(user);
    }

  @Override
  @Transactional(readOnly = true)
  public User getCurrentUser() {
      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      String email = authentication.getName(); // Use email instead of username
      return userRepository.findByEmail(email)
              .orElseThrow(() -> new RuntimeException("User not found"));
  }


    @Override
    public boolean isUserInProject(Long userId, Long projectId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // First check if user is admin - admins can access all projects
        if (user.getRoles().stream().anyMatch(role -> role.getName() == ERole.ROLE_ADMIN)) {
            return true;
        }

        // For non-admin users, check project assignment
        //return userRepository.existsByIdAndProjetsId(userId, projectId);

        return projetUserRepository.findByProjetIdAndUserId(projectId, userId).isPresent();
    }

}
