package com.fitlens.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank(message = "Name is required")
        String name
) {
}