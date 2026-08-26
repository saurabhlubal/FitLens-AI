package com.fitlens.backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class WorkoutRequest {

    private String name;

    private LocalDate date;

    private Integer duration;

    private Integer caloriesBurned;
}