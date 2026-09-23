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

            // 1. Squat
            if (!exerciseRepository.existsByName("Squat")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Squat")
                                .description("A foundational lower-body compound exercise targeting quadriceps, hamstrings, and glutes.")
                                .muscleGroup("Legs")
                                .build()
                );
            }

            // 2. Push-up
            if (!exerciseRepository.existsByName("Push-up")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Push-up")
                                .description("An upper-body bodyweight exercise targeting the chest, anterior deltoids, and triceps with core stabilization.")
                                .muscleGroup("Chest")
                                .build()
                );
            }

            // 3. Bicep Curl
            if (!exerciseRepository.existsByName("Bicep Curl")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Bicep Curl")
                                .description("An isolated arm exercise targeting the biceps brachii through elbow flexion.")
                                .muscleGroup("Arms")
                                .build()
                );
            }

            // 4. Shoulder Press
            if (!exerciseRepository.existsByName("Shoulder Press")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Shoulder Press")
                                .description("An overhead pressing movement building vertical pressing strength, deltoids, and upper body stability.")
                                .muscleGroup("Shoulders")
                                .build()
                );
            }

            // 5. Lateral Raise
            if (!exerciseRepository.existsByName("Lateral Raise")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Lateral Raise")
                                .description("An isolation exercise targeting the lateral deltoids through arm abduction in the frontal plane.")
                                .muscleGroup("Shoulders")
                                .build()
                );
            }

            // 6. Lunge
            if (!exerciseRepository.existsByName("Lunge")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Lunge")
                                .description("A unilateral leg exercise that develops balance, quadriceps, glutes, and hamstring power.")
                                .muscleGroup("Legs")
                                .build()
                );
            }

            // 7. Jumping Jacks
            if (!exerciseRepository.existsByName("Jumping Jacks")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Jumping Jacks")
                                .description("A total-body calisthenic exercise for cardiovascular endurance, rhythm, and full-body mobility.")
                                .muscleGroup("Cardio")
                                .build()
                );
            }

            // 8. Plank
            if (!exerciseRepository.existsByName("Plank")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Plank")
                                .description("An isometric core strength exercise maintaining spine neutral stability against gravitational load.")
                                .muscleGroup("Core")
                                .build()
                );
            }

            // 9. Hammer Curl
            if (!exerciseRepository.existsByName("Hammer Curl")) {
                exerciseRepository.save(
                        Exercise.builder()
                                .name("Hammer Curl")
                                .description("A neutral-grip curl targeting the brachialis and brachioradialis for forearm and arm development.")
                                .muscleGroup("Arms")
                                .build()
                );
            }
        };
    }
}