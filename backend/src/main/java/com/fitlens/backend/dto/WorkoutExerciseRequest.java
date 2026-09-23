package com.fitlens.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkoutExerciseRequest {

    private Long exerciseId;

    private Integer sets;

    private Integer reps;
}