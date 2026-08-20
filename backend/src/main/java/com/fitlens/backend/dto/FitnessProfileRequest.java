package com.fitlens.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FitnessProfileRequest {

    private Integer age;

    private Double height;

    private Double weight;

    private String fitnessGoal;

    private String activityLevel;
}