package com.fitlens.backend.controller;

import com.fitlens.backend.dto.MovementDetectionRequest;
import com.fitlens.backend.dto.MovementDetectionResponse;
import com.fitlens.backend.dto.WorkoutExerciseResponse;
import com.fitlens.backend.entity.Exercise;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.entity.WorkoutExercise;
import com.fitlens.backend.service.MovementDetectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/movement")
public class MovementDetectionController {

    private final MovementDetectionService movementDetectionService;

    public MovementDetectionController(MovementDetectionService movementDetectionService) {
        this.movementDetectionService = movementDetectionService;
    }

    /**
     * Endpoint to analyze pose telemetry, count reps, and evaluate form in real time.
     */
    @PostMapping("/analyze")
    public ResponseEntity<MovementDetectionResponse> analyzeMovement(
            @RequestBody MovementDetectionRequest request
    ) {
        MovementDetectionResponse response = movementDetectionService.analyzeMovement(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint to persist final form analysis results to a specific workout exercise.
     */
    @PostMapping("/workouts/{workoutId}/exercises/{workoutExerciseId}/save-analysis")
    public ResponseEntity<WorkoutExerciseResponse> saveAnalysis(
            @PathVariable Long workoutId,
            @PathVariable Long workoutExerciseId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        Integer reps = payload.get("reps") != null ? ((Number) payload.get("reps")).intValue() : null;
        Double formScore = payload.get("formScore") != null ? ((Number) payload.get("formScore")).doubleValue() : null;
        String aiFeedback = payload.get("aiFeedback") != null ? payload.get("aiFeedback").toString() : null;

        WorkoutExercise updated = movementDetectionService.saveWorkoutExerciseAnalysis(
                workoutId,
                workoutExerciseId,
                reps,
                formScore,
                aiFeedback,
                user
        );

        Exercise exercise = updated.getExercise();
        WorkoutExerciseResponse response = new WorkoutExerciseResponse(
                updated.getId(),
                exercise.getId(),
                exercise.getName(),
                updated.getSets(),
                updated.getReps(),
                updated.getFormScore(),
                updated.getAiFeedback()
        );

        return ResponseEntity.ok(response);
    }
}
