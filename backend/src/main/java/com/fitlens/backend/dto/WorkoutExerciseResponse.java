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

    private Integer orderIndex;

    public WorkoutExerciseResponse(
            Long id,
            Long exerciseId,
            String exerciseName,
            Integer sets,
            Integer reps,
            Double formScore,
            String aiFeedback
    ) {
        this(id, exerciseId, exerciseName, sets, reps, formScore, aiFeedback, null);
    }
}