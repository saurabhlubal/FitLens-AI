package com.fitlens.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovementDetectionRequest {

    private String exerciseName;
    private List<LandmarkPointDto> landmarks;
    private String image; // Base64 encoded frame (optional)
    private Integer currentReps;
    private String currentStage; // "up" | "down" | "holding"
    private Map<String, Object> sessionData;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandmarkPointDto {
        private Double x;
        private Double y;
        private Double z;
        private Double visibility;
    }
}
