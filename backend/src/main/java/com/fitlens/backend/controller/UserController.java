package com.fitlens.backend.controller;

import com.fitlens.backend.dto.UpdateProfileRequest;
import com.fitlens.backend.dto.UserProfileResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public UserProfileResponse getProfile(Authentication authentication) {

        User user = (User) authentication.getPrincipal();

        return UserProfileResponse.fromUser(user);
    }

    @PutMapping("/profile")
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {

        User user = (User) authentication.getPrincipal();

        user.setName(request.name());

        User updatedUser = userRepository.save(user);

        return UserProfileResponse.fromUser(updatedUser);
    }
}