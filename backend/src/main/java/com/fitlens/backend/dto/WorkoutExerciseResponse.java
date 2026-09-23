package com.fitlens.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class WorkoutExerciseResponse {

    private Long id;

    private Long exerciseId;

    private String exerciseName;

    private Integer sets;

    private Integer reps;

    private Double formScore;

    private String aiFeedback;
}