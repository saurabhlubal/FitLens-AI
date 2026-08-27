package com.fitlens.backend.controller;

import com.fitlens.backend.dto.UpdateProfileRequest;
import com.fitlens.backend.dto.UserProfileResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

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

    @PostMapping("/profile-picture")
    public UserProfileResponse uploadProfilePicture(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) throws IOException {

        if (file.isEmpty()) {
            throw new IllegalArgumentException("Profile picture cannot be empty");
        }

        // Check content type
        String contentType = file.getContentType();

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException(
                    "Only image files are allowed"
            );
        }

        // Maximum 5 MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                    "Profile picture must be smaller than 5 MB"
            );
        }

        // Create upload directory
        Path uploadDirectory = Paths.get("uploads/profile");

        Files.createDirectories(uploadDirectory);

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();

        String extension = "";

        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(
                    originalFilename.lastIndexOf(".")
            );
        }

        String filename = UUID.randomUUID() + extension;

        Path filePath = uploadDirectory.resolve(filename);

        // Save file
        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        // Get logged-in user
        User user = (User) authentication.getPrincipal();

        // Store URL in database
        String imageUrl = "/uploads/profile/" + filename;

        user.setProfilePictureUrl(imageUrl);

        User updatedUser = userRepository.save(user);

        return UserProfileResponse.fromUser(updatedUser);
    }
}