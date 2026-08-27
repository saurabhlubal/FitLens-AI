package com.fitlens.backend.service;

import com.fitlens.backend.dto.WorkoutRequest;
import com.fitlens.backend.dto.WorkoutResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.entity.Workout;
import com.fitlens.backend.repository.WorkoutExerciseRepository;
import com.fitlens.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;
    private final WorkoutExerciseRepository workoutExerciseRepository;

    public WorkoutService(
            WorkoutRepository workoutRepository,
            WorkoutExerciseRepository workoutExerciseRepository
    ) {
        this.workoutRepository = workoutRepository;
        this.workoutExerciseRepository = workoutExerciseRepository;
    }

    // ============================================================
    // CREATE WORKOUT
    // ============================================================

    public WorkoutResponse createWorkout(
            User user,
            WorkoutRequest request
    ) {

        Workout workout = Workout.builder()
                .name(request.getName())
                .date(request.getDate())
                .duration(request.getDuration())
                .caloriesBurned(request.getCaloriesBurned())
                .user(user)
                .build();

        Workout savedWorkout =
                workoutRepository.save(workout);

        return toResponse(savedWorkout);
    }

    // ============================================================
    // GET USER WORKOUTS
    // ============================================================

    public List<WorkoutResponse> getUserWorkouts(User user) {

        return workoutRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ============================================================
    // GET SINGLE WORKOUT
    // ============================================================

    public WorkoutResponse getWorkout(
            Long workoutId,
            User user
    ) {

        Workout workout = workoutRepository
                .findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        // Security check
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return toResponse(workout);
    }

    // ============================================================
    // DELETE WORKOUT
    // ============================================================

    public void deleteWorkout(
            Long workoutId,
            User user
    ) {

        Workout workout = workoutRepository
                .findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        // Security check
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Delete all exercises belonging to this workout first
        workoutExerciseRepository.deleteByWorkout(workout);

        // Then delete the workout
        workoutRepository.delete(workout);
    }

    // ============================================================
    // CONVERT ENTITY TO RESPONSE
    // ============================================================

    private WorkoutResponse toResponse(
            Workout workout
    ) {

        return new WorkoutResponse(
                workout.getId(),
                workout.getName(),
                workout.getDate(),
                workout.getDuration(),
                workout.getCaloriesBurned()
        );
    }
}