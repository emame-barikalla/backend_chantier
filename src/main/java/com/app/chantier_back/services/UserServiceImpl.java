package com.app.chantier_back.services;


import com.app.chantier_back.dto.UserDTO;
import com.app.chantier_back.entities.Role;
import com.app.chantier_back.entities.User;
import com.app.chantier_back.exceptions.ResourceNotFoundException;
import com.app.chantier_back.repositories.RoleRepository;
import com.app.chantier_back.repositories.UserRepository;
import com.app.chantier_back.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.app.chantier_back.entities.ERole;
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

    @Override


    public User createUser(UserDTO userDTO) {
        User user = new User();
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setNom(userDTO.getNom()); // Set the nom field
        user.setPrenom(userDTO.getPrenom()); // Set the prenom field
        user.setTelephone(userDTO.getTelephone()); // Set the telephone field

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
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }


}
