import api from "./api";

const aiService = {
  /**
   * Analyze pose landmarks in real time via Spring Boot -> Python AI microservice.
   */
  analyzeMovement: async (exerciseName, landmarks, currentReps = 0, currentStage = "up", sessionData = {}) => {
    const payload = {
      exerciseName,
      landmarks: landmarks.map((l) => ({
        x: l.x,
        y: l.y,
        z: l.z ?? 0,
        visibility: l.visibility ?? 1.0,
      })),
      currentReps,
      currentStage,
      sessionData,
    };

    const response = await api.post("/ai/movement/analyze", payload);
    return response.data;
  },

  /**
   * Persist final workout analysis (reps, form score, feedback) to a specific workout exercise.
   */
  saveWorkoutExerciseAnalysis: async (workoutId, workoutExerciseId, { reps, formScore, aiFeedback }) => {
    const response = await api.post(
      `/ai/movement/workouts/${workoutId}/exercises/${workoutExerciseId}/save-analysis`,
      {
        reps,
        formScore,
        aiFeedback,
      }
    );
    return response.data;
  },
};

export default aiService;
