package com.fitlens.backend.service;

import com.fitlens.backend.dto.WorkoutRequest;
import com.fitlens.backend.dto.WorkoutResponse;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.entity.Workout;
import com.fitlens.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutService(WorkoutRepository workoutRepository) {
        this.workoutRepository = workoutRepository;
    }

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

        Workout savedWorkout = workoutRepository.save(workout);

        return toResponse(savedWorkout);
    }

    public List<WorkoutResponse> getUserWorkouts(User user) {

        return workoutRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public WorkoutResponse getWorkout(
            Long workoutId,
            User user
    ) {

        Workout workout = workoutRepository
                .findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        // Security check:
        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return toResponse(workout);
    }

    private WorkoutResponse toResponse(Workout workout) {

        return new WorkoutResponse(
                workout.getId(),
                workout.getName(),
                workout.getDate(),
                workout.getDuration(),
                workout.getCaloriesBurned()
        );
    }
}