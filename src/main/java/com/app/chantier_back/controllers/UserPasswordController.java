package com.app.chantier_back.controllers;

import com.app.chantier_back.dto.PasswordChangeDTO;
import com.app.chantier_back.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class UserPasswordController {

    private final UserService userService;

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(Authentication authentication,
                                              @Valid @RequestBody PasswordChangeDTO passwordChangeDTO) {
        String email = authentication.getName();
        userService.changePassword(email, passwordChangeDTO);
        return ResponseEntity.ok().build();
    }
}