package com.fitlens.backend.repository;

import com.fitlens.backend.entity.FitnessProfile;
import com.fitlens.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FitnessProfileRepository
        extends JpaRepository<FitnessProfile, Long> {

    Optional<FitnessProfile> findByUser(User user);

    Optional<FitnessProfile> findByUserId(Long userId);
}