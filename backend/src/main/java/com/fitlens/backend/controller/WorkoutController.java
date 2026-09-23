package com.fitlens.backend.controller;

import com.fitlens.backend.dto.WorkoutRequest;
import com.fitlens.backend.dto.WorkoutResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.service.WorkoutService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    // ============================================================
    // CREATE WORKOUT
    // ============================================================

    @PostMapping
    public ResponseEntity<WorkoutResponse> createWorkout(
            @RequestBody WorkoutRequest request,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        WorkoutResponse response =
                workoutService.createWorkout(user, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ============================================================
    // GET USER WORKOUTS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<WorkoutResponse>> getUserWorkouts(
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                workoutService.getUserWorkouts(user)
        );
    }

    // ============================================================
    // GET SINGLE WORKOUT
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<WorkoutResponse> getWorkout(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        return ResponseEntity.ok(
                workoutService.getWorkout(id, user)
        );
    }

    // ============================================================
    // DELETE WORKOUT
    // ============================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkout(
            @PathVariable Long id,
            Authentication authentication
    ) {

        User user = (User) authentication.getPrincipal();

        workoutService.deleteWorkout(id, user);

        return ResponseEntity.noContent().build();
    }
}