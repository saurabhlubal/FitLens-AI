package com.fitlens.backend.service;

import com.fitlens.backend.dto.FitnessProfileRequest;
import com.fitlens.backend.dto.FitnessProfileResponse;
import com.fitlens.backend.entity.FitnessProfile;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.repository.FitnessProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class FitnessProfileService {

    private final FitnessProfileRepository fitnessProfileRepository;

    public FitnessProfileService(
            FitnessProfileRepository fitnessProfileRepository
    ) {
        this.fitnessProfileRepository = fitnessProfileRepository;
    }

    public FitnessProfileResponse getProfile(User user) {

        FitnessProfile profile = fitnessProfileRepository
                .findByUser(user)
                .orElse(null);

        if (profile == null) {
            return null;
        }

        return new FitnessProfileResponse(
                profile.getId(),
                profile.getAge(),
                profile.getHeight(),
                profile.getWeight(),
                profile.getFitnessGoal(),
                profile.getActivityLevel()
        );
    }

    public FitnessProfileResponse createOrUpdateProfile(
            User user,
            FitnessProfileRequest request
    ) {

        FitnessProfile profile = fitnessProfileRepository
                .findByUser(user)
                .orElse(
                        FitnessProfile.builder()
                                .user(user)
                                .build()
                );

        profile.setAge(request.getAge());
        profile.setHeight(request.getHeight());
        profile.setWeight(request.getWeight());
        profile.setFitnessGoal(request.getFitnessGoal());
        profile.setActivityLevel(request.getActivityLevel());

        FitnessProfile savedProfile =
                fitnessProfileRepository.save(profile);

        return new FitnessProfileResponse(
                savedProfile.getId(),
                savedProfile.getAge(),
                savedProfile.getHeight(),
                savedProfile.getWeight(),
                savedProfile.getFitnessGoal(),
                savedProfile.getActivityLevel()
        );
    }
}