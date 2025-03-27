package com.app.chantier_back.services.interfaces;

import com.app.chantier_back.dto.LoginRequest;

public interface AuthService {
    String login(LoginRequest loginRequest);
}