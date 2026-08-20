package com.fitlens.backend.controller;

import com.fitlens.backend.dto.FitnessProfileRequest;
import com.fitlens.backend.dto.FitnessProfileResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.service.FitnessProfileService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fitness-profile")
public class FitnessProfileController {

    private final FitnessProfileService fitnessProfileService;

    public FitnessProfileController(
            FitnessProfileService fitnessProfileService
    ) {
        this.fitnessProfileService = fitnessProfileService;
    }

    @GetMapping
    public FitnessProfileResponse getProfile(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return fitnessProfileService.getProfile(user);
    }

    @PostMapping
    public FitnessProfileResponse createOrUpdateProfile(
            Authentication authentication,
            @Valid @RequestBody FitnessProfileRequest request
    ) {

        User user = (User) authentication.getPrincipal();

        return fitnessProfileService.createOrUpdateProfile(
                user,
                request
        );
    }
}