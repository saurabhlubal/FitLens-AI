package com.fitlens.backend.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MovementDetectionResponse {

    private Boolean success;
    private String exerciseName;
    private String stage;
    private Integer repetitionCount;
    private Boolean repIncremented;
    private Double formScore;
    private Boolean isCorrectForm;
    private String feedback;
    private JointAnglesDto jointAngles;
    private Map<String, Object> metrics;
    private String aiState;
    private String detectedExercise;
    private Map<String, Object> poseQuality;
    private Map<String, Object> sessionData;
    private Double timestamp;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JointAnglesDto {
        private Double leftElbow;
        private Double rightElbow;
        private Double leftShoulder;
        private Double rightShoulder;
        private Double leftHip;
        private Double rightHip;
        private Double leftKnee;
        private Double rightKnee;
        private Double backAngle;
    }
}
