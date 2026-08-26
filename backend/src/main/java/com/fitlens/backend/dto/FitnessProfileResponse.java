package com.fitlens.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FitnessProfileResponse {

    private Long id;

    private Integer age;

    private Double height;

    private Double weight;

    private String fitnessGoal;

    private String activityLevel;
}