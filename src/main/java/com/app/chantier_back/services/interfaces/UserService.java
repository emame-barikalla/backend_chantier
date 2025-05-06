package com.app.chantier_back.services.interfaces;


import com.app.chantier_back.dto.UserDTO;
import com.app.chantier_back.entities.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.app.chantier_back.entities.enumeration.ERole;
import java.util.List;
import java.util.Optional;

public interface UserService extends UserDetailsService {
    User createUser(UserDTO userDTO);
    List<User> getAllUsers();
    User updateUser(Long id, UserDTO userDTO);
    void deleteUser(Long id);

    User getUserById(Long id);


    List<User> getUsersByRole(ERole roleName);

    User getUserByEmail(String email);
}