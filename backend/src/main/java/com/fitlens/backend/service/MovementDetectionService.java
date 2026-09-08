package com.fitlens.backend.service;

import com.fitlens.backend.dto.MovementDetectionRequest;
import com.fitlens.backend.dto.MovementDetectionResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.entity.Workout;
import com.fitlens.backend.entity.WorkoutExercise;
import com.fitlens.backend.repository.WorkoutExerciseRepository;
import com.fitlens.backend.repository.WorkoutRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class MovementDetectionService {

    private final RestTemplate restTemplate;
    private final String aiServiceUrl;
    private final WorkoutRepository workoutRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;

    public MovementDetectionService(
            @Value("${ai.service.url:http://localhost:8001}") String aiServiceUrl,
            WorkoutRepository workoutRepository,
            WorkoutExerciseRepository workoutExerciseRepository
    ) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(5000);
        this.restTemplate = new RestTemplate(factory);
        this.aiServiceUrl = aiServiceUrl;
        this.workoutRepository = workoutRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
    }

    /**
     * Proxies landmark telemetry to the Python AI service for kinematics & repetition inference.
     */
    public MovementDetectionResponse analyzeMovement(MovementDetectionRequest request) {
        try {
            String url = aiServiceUrl + "/api/ai/movement/detect-landmarks";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<MovementDetectionRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<MovementDetectionResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    MovementDetectionResponse.class
            );

            return response.getBody();
        } catch (Exception e) {
            // Fallback response if AI service is temporarily unreachable
            return MovementDetectionResponse.builder()
                    .success(false)
                    .exerciseName(request.getExerciseName())
                    .stage(request.getCurrentStage() != null ? request.getCurrentStage() : "up")
                    .repetitionCount(request.getCurrentReps() != null ? request.getCurrentReps() : 0)
                    .repIncremented(false)
                    .formScore(85.0)
                    .isCorrectForm(true)
                    .feedback("AI service offline. Running in local fallback mode: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Saves analyzed form telemetry (form score, reps, and AI feedback) directly into the user's WorkoutExercise.
     */
    public WorkoutExercise saveWorkoutExerciseAnalysis(
            Long workoutId,
            Long workoutExerciseId,
            Integer reps,
            Double formScore,
            String aiFeedback,
            User user
    ) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() -> new RuntimeException("Workout not found"));

        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        WorkoutExercise workoutExercise = workoutExerciseRepository.findById(workoutExerciseId)
                .orElseThrow(() -> new RuntimeException("Workout exercise not found"));

        if (!workoutExercise.getWorkout().getId().equals(workoutId)) {
            throw new RuntimeException("Workout exercise mismatch");
        }

        if (reps != null && reps > 0) {
            workoutExercise.setReps(reps);
        }
        if (formScore != null) {
            workoutExercise.setFormScore(formScore);
        }
        if (aiFeedback != null && !aiFeedback.isBlank()) {
            workoutExercise.setAiFeedback(aiFeedback);
        }

        return workoutExerciseRepository.save(workoutExercise);
    }
}
