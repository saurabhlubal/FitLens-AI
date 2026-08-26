package com.fitlens.backend.config;

import com.fitlens.backend.entity.Exercise;
import com.fitlens.backend.repository.ExerciseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeExercises(
            ExerciseRepository exerciseRepository
    ) {
        return args -> {

            if (!exerciseRepository.existsByName("Squat")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Squat")
                                .description(
                                        "A lower-body exercise that targets the legs and glutes."
                                )
                                .muscleGroup("Legs")
                                .build()
                );
            }

            if (!exerciseRepository.existsByName("Push-up")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Push-up")
                                .description(
                                        "An upper-body bodyweight exercise targeting the chest, shoulders and triceps."
                                )
                                .muscleGroup("Chest")
                                .build()
                );
            }

            if (!exerciseRepository.existsByName("Bicep Curl")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Bicep Curl")
                                .description(
                                        "An exercise targeting the biceps using a curling movement."
                                )
                                .muscleGroup("Arms")
                                .build()
                );
            }
        };
    }
}