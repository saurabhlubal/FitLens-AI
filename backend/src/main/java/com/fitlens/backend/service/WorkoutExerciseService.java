package com.fitlens.backend.service;

import com.fitlens.backend.dto.WorkoutExerciseRequest;
import com.fitlens.backend.dto.WorkoutExerciseResponse;
import com.fitlens.backend.entity.Exercise;
import com.fitlens.backend.entity.User;
import com.fitlens.backend.entity.Workout;
import com.fitlens.backend.entity.WorkoutExercise;
import com.fitlens.backend.repository.ExerciseRepository;
import com.fitlens.backend.repository.WorkoutExerciseRepository;
import com.fitlens.backend.repository.WorkoutRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkoutExerciseService {

    private final WorkoutExerciseRepository workoutExerciseRepository;
    private final WorkoutRepository workoutRepository;
    private final ExerciseRepository exerciseRepository;

    public WorkoutExerciseService(
            WorkoutExerciseRepository workoutExerciseRepository,
            WorkoutRepository workoutRepository,
            ExerciseRepository exerciseRepository
    ) {
        this.workoutExerciseRepository = workoutExerciseRepository;
        this.workoutRepository = workoutRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public WorkoutExerciseResponse addExerciseToWorkout(
            Long workoutId,
            WorkoutExerciseRequest request,
            User user
    ) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() ->
                        new RuntimeException("Exercise not found")
                );

        WorkoutExercise workoutExercise = WorkoutExercise.builder()
                .workout(workout)
                .exercise(exercise)
                .sets(request.getSets())
                .reps(request.getReps())
                .build();

        WorkoutExercise saved =
                workoutExerciseRepository.save(workoutExercise);

        return toResponse(saved);
    }

    public List<WorkoutExerciseResponse> getWorkoutExercises(
            Long workoutId,
            User user
    ) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        return workoutExerciseRepository.findByWorkout(workout)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private WorkoutExerciseResponse toResponse(
            WorkoutExercise workoutExercise
    ) {
        Exercise exercise = workoutExercise.getExercise();

        return new WorkoutExerciseResponse(
                workoutExercise.getId(),
                exercise.getId(),
                exercise.getName(),
                workoutExercise.getSets(),
                workoutExercise.getReps(),
                workoutExercise.getFormScore(),
                workoutExercise.getAiFeedback()
        );
    }
}