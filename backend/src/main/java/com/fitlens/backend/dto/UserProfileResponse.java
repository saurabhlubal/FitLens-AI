package com.fitlens.backend.dto;

import com.fitlens.backend.entity.User;

public record UserProfileResponse(
        Long id,
        String name,
        String email,
        String profilePictureUrl
) {

    public static UserProfileResponse fromUser(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfilePictureUrl()
        );
    }
}