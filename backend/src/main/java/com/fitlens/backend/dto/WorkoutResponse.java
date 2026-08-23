package com.fitlens.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class WorkoutResponse {

    private Long id;

    private String name;

    private LocalDate date;

    private Integer duration;

    private Integer caloriesBurned;
}