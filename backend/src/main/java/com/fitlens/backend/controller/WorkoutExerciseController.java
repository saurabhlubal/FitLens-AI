package com.fitlens.backend.controller;

import com.fitlens.backend.dto.WorkoutExerciseRequest;
import com.fitlens.backend.dto.WorkoutExerciseResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.service.WorkoutExerciseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts/{workoutId}/exercises")
public class WorkoutExerciseController {

    private final WorkoutExerciseService workoutExerciseService;

    public WorkoutExerciseController(
            WorkoutExerciseService workoutExerciseService
    ) {
        this.workoutExerciseService = workoutExerciseService;
    }

    @PostMapping
    public ResponseEntity<WorkoutExerciseResponse> addExerciseToWorkout(
            @PathVariable Long workoutId,
            @RequestBody WorkoutExerciseRequest request,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        WorkoutExerciseResponse response =
                workoutExerciseService.addExerciseToWorkout(
                        workoutId,
                        request,
                        user
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkoutExerciseResponse>> getWorkoutExercises(
            @PathVariable Long workoutId,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                workoutExerciseService.getWorkoutExercises(
                        workoutId,
                        user
                )
        );
    }
}