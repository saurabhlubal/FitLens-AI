package com.fitlens.backend.controller;

import com.fitlens.backend.dto.ExerciseResponse;
import com.fitlens.backend.entity.Exercise;
import com.fitlens.backend.repository.ExerciseRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    public ExerciseController(
            ExerciseRepository exerciseRepository
    ) {
        this.exerciseRepository = exerciseRepository;
    }

    @GetMapping
    public ResponseEntity<List<ExerciseResponse>> getExercises() {

        List<ExerciseResponse> exercises =
                exerciseRepository.findAll()
                        .stream()
                        .map(this::toResponse)
                        .toList();

        return ResponseEntity.ok(exercises);
    }

    private ExerciseResponse toResponse(Exercise exercise) {

        return new ExerciseResponse(
                exercise.getId(),
                exercise.getName(),
                exercise.getDescription(),
                exercise.getMuscleGroup()
        );
    }
}