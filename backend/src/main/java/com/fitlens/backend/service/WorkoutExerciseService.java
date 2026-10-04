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

        List<WorkoutExercise> existing = workoutExerciseRepository.findByWorkout(workout);
        int nextOrderIndex = request.getOrderIndex() != null ? request.getOrderIndex() : existing.size();

        WorkoutExercise workoutExercise = WorkoutExercise.builder()
                .workout(workout)
                .exercise(exercise)
                .sets(request.getSets())
                .reps(request.getReps())
                .orderIndex(nextOrderIndex)
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
                .sorted((a, b) -> {
                    int orderA = a.getOrderIndex() != null ? a.getOrderIndex() : (a.getId() != null ? a.getId().intValue() : 0);
                    int orderB = b.getOrderIndex() != null ? b.getOrderIndex() : (b.getId() != null ? b.getId().intValue() : 0);
                    return Integer.compare(orderA, orderB);
                })
                .map(this::toResponse)
                .toList();
    }

    public WorkoutExerciseResponse updateWorkoutExercise(
            Long workoutId,
            Long workoutExerciseId,
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

        WorkoutExercise workoutExercise =
                workoutExerciseRepository.findById(workoutExerciseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                         "Workout exercise not found"
                                )
                        );

        if (!workoutExercise.getWorkout().getId().equals(workoutId)) {
            throw new RuntimeException("Workout exercise mismatch");
        }

        if (request.getSets() != null) {
            workoutExercise.setSets(request.getSets());
        }
        if (request.getReps() != null) {
            workoutExercise.setReps(request.getReps());
        }
        if (request.getOrderIndex() != null) {
            workoutExercise.setOrderIndex(request.getOrderIndex());
        }

        WorkoutExercise updated =
                workoutExerciseRepository.save(workoutExercise);

        return toResponse(updated);
    }

    @org.springframework.transaction.annotation.Transactional
    public List<WorkoutExerciseResponse> reorderExercises(
            Long workoutId,
            List<Long> orderedIds,
            User user
    ) {
        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        List<WorkoutExercise> exercises = workoutExerciseRepository.findByWorkout(workout);
        java.util.Map<Long, WorkoutExercise> map = exercises.stream()
                .collect(java.util.stream.Collectors.toMap(WorkoutExercise::getId, java.util.function.Function.identity()));

        int order = 0;
        for (Long id : orderedIds) {
            WorkoutExercise we = map.get(id);
            if (we != null) {
                we.setOrderIndex(order++);
                workoutExerciseRepository.save(we);
            }
        }

        return getWorkoutExercises(workoutId, user);
    }

    public void deleteWorkoutExercise(
            Long workoutId,
            Long workoutExerciseId,
            User user
    ) {

        Workout workout = workoutRepository.findById(workoutId)
                .orElseThrow(() ->
                        new RuntimeException("Workout not found")
                );

        if (!workout.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        WorkoutExercise workoutExercise =
                workoutExerciseRepository.findById(workoutExerciseId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Workout exercise not found"
                                )
                        );

        if (!workoutExercise.getWorkout().getId().equals(workoutId)) {
            throw new RuntimeException("Workout exercise mismatch");
        }

        workoutExerciseRepository.delete(workoutExercise);
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
                workoutExercise.getAiFeedback(),
                workoutExercise.getOrderIndex()
        );
    }
}